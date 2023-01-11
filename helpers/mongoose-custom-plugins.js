function setSchemaOptions(schema) {
  schema.set("toJSON", { getters: true });
  schema.set("toObject", { getters: true });
  schema.set("timestamps", true);
  schema.set("id", false);
}

/* Not used */
// function setUpdateOptions(schema) {
// schema.pre("updateOne", function () {
//   this.setOptions({ new: true, runValidators: true });
// });
// schema.pre("findOneAndUpdate", function () {
//   this.setOptions({ new: true, runValidators: true });
// });
// }

module.exports = { setSchemaOptions };
