export default db => {
  const RoleSchema = new db.mongoose.Schema({
    name: String,
  });
  const Role = db.mongoose.model('Role', RoleSchema);
  return Role;
};
