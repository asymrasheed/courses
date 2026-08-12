const slugify = require("slugify");

async function makeUniqueSlug(Model, text, currentId = null) {
  const base = slugify(text, { lower: true, strict: true, trim: true }) || "item";
  let slug = base;
  let suffix = 2;

  while (
    await Model.exists({ slug, ...(currentId ? { _id: { $ne: currentId } } : {}) })
  ) {
    slug = `${base}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

module.exports = { makeUniqueSlug };
