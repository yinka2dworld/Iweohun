import { useLocalSearchParams } from 'expo-router';
import BookForm from '@/components/BookForm';

export default function EditBookScreen() {
  const params = useLocalSearchParams();
  const bookId = Array.isArray(params.bookId) ? params.bookId[0] : params.bookId;

  return <BookForm mode="edit" bookId={bookId} />;
}
