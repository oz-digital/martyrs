import { BigNumber } from 'bignumber.js';
import { Types } from 'mongoose';
const ObjectId = { Types }.Types.ObjectId;
BigNumber.config({
  EXPONENTIAL_AT: [-1000, 2000],
});
const VIEWS_REWARD_COEFF = '0.1';
const WDT_DECIMALS = 8;
const calculateRewardForPost = (snapshot, viewsCount, reactionsCount, commentsCount) => {
  console.log('snapshot', snapshot);
  if (snapshot) {
    return new BigNumber(Math.max(viewsCount - snapshot.views, 0))
      .multipliedBy(VIEWS_REWARD_COEFF)
      .plus(Math.max(reactionsCount - snapshot.reactions, 0))
      .plus(Math.max(commentsCount - snapshot.comments, 0));
  }
  return new BigNumber('10').plus(new BigNumber(viewsCount).multipliedBy(VIEWS_REWARD_COEFF)).plus(reactionsCount).plus(commentsCount);
};
const rewardsControllerFactory = (db, wdmClient, wss) => {
  const Blogpost = db.blogpost;
  const Reaction = db.reaction;
  const Comment = db.comment;
  const Reward = db.reward;
  const Wallet = db.wallet;
  const lookup = {};
  wss.on('connection', (ws, req) => {
    ws.type = 'rewards';
    if (req.userId) {
      lookup[req.userId] = ws;
      ws.on('close', () => {
        delete lookup[req.userId];
      });
    }
  });
  const listRewards = async (req, res) => {
    const userId = new ObjectId(req.userId);
    try {
      const aggregationResults = await Blogpost.aggregate([
        // Соответствие блогпостов для данного пользователя
        { $match: { 'creator.target': userId } },
        // Добавление информации о реакциях и комментариях
        {
          $lookup: {
            from: 'reactions',
            localField: '_id',
            foreignField: 'target',
            as: 'reactions',
          },
        },
        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'target',
            as: 'comments',
          },
        },
        // Добавление информации о предыдущей награде
        {
          $lookup: {
            from: 'rewards',
            let: { blogId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ['$user', userId] }, { $eq: ['$type', 'blogpost'] }, { $eq: ['$target', '$$blogId'] }],
                  },
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 1 },
            ],
            as: 'previousReward',
          },
        },
        // Преобразование результатов
        {
          $project: {
            _id: 1,
            user: req.userId,
            type: 'blogpost',
            views: 1,
            reactionsCount: { $size: '$reactions' },
            commentsCount: { $size: '$comments' },
            previousReward: { $arrayElemAt: ['$previousReward', 0] },
            name: 1,
            content: 1,
            url: 1,
          },
        },
      ]);
      const rewards = aggregationResults.map(result => ({
        user: result.user,
        type: result.type,
        amount: calculateRewardForPost(result.previousReward?.snapshot, result.views, result.reactionsCount, result.commentsCount),
        name: result.name,
        content: result.content,
        url: result.url,
      }));
      res.status(200).send(rewards);
    } catch (error) {
      res.status(500).send({ message: 'Произошла ошибка при получении наград', error: error.message });
    }
  };
  const collectTokens = async (req, res) => {
    const blogs = await Blogpost.find({ 'creator.target': req.userId }).exec();
    let totalRewards = new BigNumber(0);
    for (const blog of blogs) {
      const reactions = await Reaction.countDocuments({ target: { $in: blog._id } }).exec();
      const comments = await Comment.countDocuments({ target: { $in: blog._id } }).exec();
      const previousReward = await Reward.findOne({
        user: req.userId,
        type: 'blogpost',
        target: blog._id,
      })
        .sort({ createdAt: -1 })
        .exec();
      const reward = calculateRewardForPost(previousReward?.snapshot, blog.views, reactions, comments);
      if (reward.gt(0)) {
        totalRewards = totalRewards.plus(reward);
        const snapshot = {
          views: previousReward ? (previousReward.snapshot.views < blog.views ? blog.views : previousReward.snapshot.views) : blog.views,
          reactions: previousReward ? (previousReward.snapshot.reactions < reactions ? reactions : previousReward.snapshot.reactions) : reactions,
          comments: previousReward ? (previousReward.snapshot.comments < comments ? comments : previousReward.snapshot.comments) : comments,
        };
        await Reward.create({
          user: req.userId,
          type: 'blogpost',
          target: blog._id,
          amount: reward.toString(),
          snapshot: snapshot,
        });
      }
    }
    if (totalRewards.gt(0)) {
      await wdmClient.transfer(totalRewards.shiftedBy(WDT_DECIMALS).toString(), req.body.recipient, req.userId);
    }
    res.status(200).send();
  };
  const requestDeposit = async (req, res) => {
    const response = await wdmClient.createDepositRequest(req.body.network, req.body.amount, req.body.token, req.userId);
    res.status(200).send(response.data);
  };
  const cancelDeposit = async (req, res) => {
    const response = await wdmClient.cancelDeposit(req.body.id, req.userId);
    res.status(200).send(response.data);
  };
  const getDepositConfig = async (req, res) => {
    const response = await wdmClient.getDepositConfig();
    res.status(200).send(response.data);
  };
  const handleDepositUpdate = async (req, res) => {
    if (req.body.status === 'TRANSFER_STATUS_COMPLETED') {
      const userWallet = await Wallet.findOne({ owner: new ObjectId(req.body.user) });
      const amount = new BigNumber(req.body.amount).shiftedBy(-WDT_DECIMALS).dividedBy(process.env.TOKEN_EXCHANGE_RATE).toString();
      if (userWallet) {
        const topupIndex = userWallet.balances.findIndex(b => b.name === 'WDT');
        if (topupIndex < 0) {
          userWallet.balances.push({ name: 'WDT', amount: +amount, locked_amount: 0 });
        } else {
          userWallet.balances[topupIndex] = {
            name: 'WDT',
            amount: userWallet.balances[topupIndex].amount + +amount,
            locked_amount: userWallet.balances[topupIndex].locked_amount,
          };
        }
        await userWallet.save();
      } else {
        await Wallet.create({
          owner: new ObjectId(req.body.user),
          balances: [{ name: 'WDT', amount: +amount, locked_amount: 0 }],
        });
      }
    }
    if (lookup[req.body.user]) {
      lookup[req.body.user].send(JSON.stringify(req.body));
    }
    res.status(200).send();
  };
  return {
    listRewards,
    collectTokens,
    requestDeposit,
    getDepositConfig,
    cancelDeposit,
    handleDepositUpdate,
  };
};
export default rewardsControllerFactory;
