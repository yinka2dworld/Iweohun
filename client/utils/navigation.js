export function navigateToBookDetails(router, bookId) {
  if (bookId === null || bookId === undefined || String(bookId).trim() === '') {
    console.error('Cannot open book details without a book ID.');
    return;
  }

  router.push({
    pathname: '/book-details/[bookId]',
    params: { bookId: String(bookId) },
  });
}
