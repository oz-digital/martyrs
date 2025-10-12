import queryProcessorCore from '@martyrs/src/modules/core/controllers/utils/queryProcessor.js';
const commentControllerFactory = db => {
  const Comment = db.comment;
  const Membership = db.membership;
  const read = async (req, res) => {
    try {
      const { target, type, user, maxDepth = 4, parentId = null, format = 'tree', sortParam = 'createdAt', sortOrder = 'desc' } = req.query;
      let conditions = {};
      if (target) conditions.target = new db.mongoose.Types.ObjectId(target);
      if (type) conditions.type = type;
      if (parentId) {
        conditions.parent = new db.mongoose.Types.ObjectId(parentId);
      } else {
        conditions.parent = null;
      }
      let blockedMembers = [];
      if (user) {
        const memberships = await Membership.find({ user: user, role: 'blocked' });
        blockedMembers = memberships.map(membership => membership.target);
      }
      const pipeline = [
        { $match: conditions },
        ...(format === 'tree'
          ? [
              {
                $graphLookup: {
                  from: 'comments',
                  startWith: '$_id',
                  connectFromField: '_id',
                  connectToField: 'parent',
                  as: 'children',
                  maxDepth: Number(req.query.maxDepth),
                  depthField: 'childDepth',
                },
              },
            ]
          : []),
        {
          $lookup: {
            from: 'users',
            localField: 'owner.target',
            foreignField: '_id',
            as: 'owner',
          },
        },
        { $unwind: '$owner' },
        {
          $lookup: {
            from: 'users',
            localField: 'children.owner.target',
            foreignField: '_id',
            as: 'childUsers',
          },
        },
        ...queryProcessorCore.getSortingOptions(sortParam, sortOrder),
        {
          $project: {
            _id: 1,
            content: 1,
            type: 1,
            target: 1,
            'owner.username': 1,
            'owner.profile.photo': 1,
            'owner.profile.name': 1,
            'owner._id': 1,
            depth: 1,
            createdAt: 1,
            ...(format === 'tree'
              ? {
                  childrenCount: { $size: '$children' },
                  children: {
                    $map: {
                      input: '$children',
                      as: 'child',
                      in: {
                        _id: '$$child._id',
                        content: '$$child.content',
                        type: '$$child.type',
                        parent: '$$child.parent',
                        target: '$$child.target',
                        owner: {
                          $arrayElemAt: [
                            {
                              $filter: {
                                input: '$childUsers',
                                as: 'childUser',
                                cond: { $eq: ['$$childUser._id', '$$child.owner.target'] },
                              },
                            },
                            0,
                          ],
                        },
                        depth: '$$child.depth',
                        createdAt: '$$child.createdAt',
                        childrenCount: { $size: '$$child.children' },
                      },
                    },
                  },
                }
              : {}),
          },
        },
      ];
      if (blockedMembers.length > 0) {
        pipeline.unshift({ $match: { user: { $nin: blockedMembers } } });
      }
      const comments = await Comment.aggregate(pipeline);
      function buildCommentTree(comments) {
        // Создаем Map для быстрого доступа ко всем комментариям по их ID
        const commentMap = new Map();
        // Функция для преобразования MongoDB ObjectId в строку
        const objectIdToString = id => id.toString();
        // Функция для добавления комментария и его дочерних элементов в Map
        function addToMap(comment) {
          const commentId = objectIdToString(comment._id);
          if (!commentMap.has(commentId)) {
            commentMap.set(commentId, { ...comment, children: [] });
            if (comment.children && comment.children.length > 0) {
              comment.children.forEach(addToMap);
            }
          }
        }
        // Добавляем все комментарии и их дочерние элементы в Map
        comments.forEach(addToMap);
        // Строим дерево
        commentMap.forEach(comment => {
          if (comment.parent) {
            const parentId = objectIdToString(comment.parent);
            const parent = commentMap.get(parentId);
            if (parent) {
              parent.children.push(comment);
            }
          }
        });
        // Функция для рекурсивной сортировки дочерних комментариев
        function sortChildren(comment) {
          if (comment.children.length > 0) {
            comment.children.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            comment.children.forEach(sortChildren);
          }
        }
        // Получаем корневые комментарии и сортируем их
        const rootComments = comments
          .map(comment => {
            const commentId = objectIdToString(comment._id);
            return commentMap.get(commentId);
          })
          .filter(comment => !comment.parent);
        // Сортируем корневые комментарии по createdAt
        rootComments.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        // Рекурсивно сортируем дочерние комментарии
        rootComments.forEach(sortChildren);
        return rootComments;
      }
      let commentsTree = format === 'tree' ? buildCommentTree(comments) : comments;
      res.status(200).json(commentsTree);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
  const create = async (req, res) => {
    try {
      const { user, type, target, content, parent, creator, owner } = req.body;
      let depth = 0;
      if (parent) {
        const parentComment = await Comment.findById(parent);
        if (!parentComment) {
          return res.status(404).send({ message: 'Parent comment not found.' });
        }
        depth = parentComment.depth + 1;
      }
      const comment = new Comment({
        user,
        type,
        target,
        content,
        parent,
        creator,
        owner,
        depth,
      });
      const savedComment = await comment.save();
      if (parent) {
        await Comment.findByIdAndUpdate(parent, {
          $push: { children: savedComment._id },
        });
      }
      const populatedComment = await Comment.findById(savedComment._id)
        .populate({
          path: 'owner.target',
          select: 'username profile.photo profile.name _id',
        })
        .populate({
          path: 'creator.target',
          select: 'username profile.photo profile.name _id',
        });
      res.status(201).send(populatedComment);
    } catch (err) {
      console.error(err);
      res.status(500).send({
        message: err.message || 'Some error occurred while creating the comment.',
      });
    }
  };
  const update = async (req, res) => {
    try {
      const comment = await Comment.findByIdAndUpdate(req.params._id, req.body, { new: true })
        .populate({
          path: 'creator.target',
          select: 'username profile.photo profile.name _id',
        })
        .populate({
          path: 'owner.target',
          select: 'username profile.photo profile.name _id',
        });
      if (!comment) {
        return res.status(404).send({ message: 'Comment not found.' });
      }
      res.status(200).send(comment);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  const deleteComment = async (req, res) => {
    try {
      const comment = await Comment.findByIdAndRemove(req.params._id);
      if (!comment) {
        return res.status(404).send({ message: 'Comment is not deleted.' });
      }
      res.status(200).send(comment);
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  };
  return {
    read,
    create,
    update,
    delete: deleteComment,
  };
};
export default commentControllerFactory;
