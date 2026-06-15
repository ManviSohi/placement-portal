// src/utils/pagination.utils.js

// getPagination takes raw query params and returns safe, validated values.
// We never trust user input directly — they could send page=-1 or limit=99999.
const getPagination = (query) => {
  // parseInt converts "2" (string from URL) to 2 (number)
  // The || provides a default if the value is missing or NaN
  let page  = parseInt(query.page,  10) || 1;
  let limit = parseInt(query.limit, 10) || 10;

  // Clamp values to safe ranges
  if (page  < 1)   page  = 1;
  if (limit < 1)   limit = 1;
  if (limit > 100) limit = 100; // Never allow more than 100 per page

  // OFFSET tells PostgreSQL how many rows to skip.
  // Page 1: skip 0.  Page 2: skip 10.  Page 3: skip 20.
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

// buildPaginationMeta creates the metadata object sent with every paginated response.
// The frontend uses this to render page numbers and "next/previous" buttons.
const buildPaginationMeta = (totalCount, page, limit) => {
  const totalPages = Math.ceil(totalCount / limit);
  return {
    totalCount,          // e.g. 10000
    totalPages,          // e.g. 1000
    currentPage: page,   // e.g. 3
    limit,               // e.g. 10
    hasNextPage:     page < totalPages,
    hasPreviousPage: page > 1,
  };
};

module.exports = { getPagination, buildPaginationMeta };