export default (function initializeMusicPolicies(abacAccessControl) {
  // Policy for handling music resource ownership
  abacAccessControl.registerResourcePolicy('tracks', async context => {
    const { user, action, currentResource, resourceModel } = context;
    const ObjectId = abacAccessControl.db.mongoose.Types.ObjectId;
    // Allow public read access for published tracks
    if (action === 'read' && currentResource?.status === 'published' && currentResource?.isPublic === true) {
      return true;
    }
    // For create actions, verify ownership
    if (action === 'create') {
      // Ensure that creator.target matches the authenticated user
      if (context.data.creator && context.data.creator.target) {
        return context.data.creator.target.toString() === user.toString();
      }
      return false;
    }
    // For update and delete, verify ownership
    if (['update', 'edit', 'delete'].includes(action) && currentResource) {
      // If the resource has an organization owner, check if user belongs to that organization
      if (currentResource.owner && currentResource.owner.type === 'Organization') {
        // Here you would typically check if the user is part of the organization
        // This would require a query to the organization's members
        const Organization = abacAccessControl.db.organization;
        const org = await Organization.findOne({
          _id: currentResource.owner.target,
          members: { $elemMatch: { user: new ObjectId(user) } },
        });
        if (org) return true;
      }
      // Check if the user is the creator
      if (currentResource.creator && currentResource.creator.target && currentResource.creator.target.toString() === user.toString()) {
        return true;
      }
      return false;
    }
    // Default access denied
    return false;
  });
  // Apply the same policies to albums
  abacAccessControl.registerResourcePolicy('albums', async context => {
    // Reuse the track policy logic
    return abacAccessControl.policies.resources.tracks(context);
  });
  // Apply the same policies to playlists
  abacAccessControl.registerResourcePolicy('playlists', async context => {
    const { user, action, currentResource } = context;
    // Special case for collaborative playlists
    if (currentResource && currentResource.isCollaborative && currentResource.collaborators && currentResource.collaborators.some(collaborator => collaborator.toString() === user.toString())) {
      // Collaborators can edit but not delete
      if (action === 'edit' || action === 'update') {
        return true;
      }
    }
    // For other cases, reuse the track policy logic
    return abacAccessControl.policies.resources.tracks(context);
  });
  // Apply the same policies to artists
  abacAccessControl.registerResourcePolicy('artists', async context => {
    // Reuse the track policy logic
    return abacAccessControl.policies.resources.tracks(context);
  });
  return abacAccessControl;
});
