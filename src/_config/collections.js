/** All blog posts as a collection. */
export const getAllPosts = collection => {
  return collection.getFilteredByGlob('./src/posts/**/*.md').reverse();
};

/** All projects as a collection */
export const getAllProjects = collection => {
  const projects = collection.getFilteredByGlob('./src/projects/**/*.md');
  // Sort the projects alphabetically by title (case-insensitive) using localeCompare
  return projects.sort((a, b) => {
    const titleA = String(a.data.title || ''); // Ensure title is a string
    const titleB = String(b.data.title || ''); // Ensure title is a string
    // 'base' sensitivity treats 'a' and 'A' as the same for sorting.
    // The 'undefined' argument for locales uses the default runtime locale.
    return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
  });
};

/** All relevant pages as a collection for sitemap.xml */
export const showInSitemap = collection => {
  return collection.getFilteredByGlob('./src/**/*.{md,njk}');
};

/** All tags from all posts as a collection - excluding custom collections */
export const tagList = collection => {
  const tagsSet = new Set();
  collection.getAll().forEach(item => {
    // Exclude items that don't have tags or are archived
    if (!item.data.tags || item.data.isArchived) return;
    item.data.tags
      .filter(tag => !['posts', 'docs', 'all']
      .includes(tag))
      .forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};
