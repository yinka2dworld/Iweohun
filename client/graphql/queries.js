import {  gql } from '@apollo/client';


  export const GET_BOOKS = gql`
     query Books {
    books {
      id
      bookPhoto
      bookName
      bookDescription
      bookAuthor
      likes
    }
  }
`;

export const BOOK = gql`
query Book($bookId: ID!) {
  book(id: $bookId) {
    id
    bookPhoto
    bookName
    bookDescription
    bookAuthor
    likes
  }
}
`;

export const SEARCHBOOK = gql`
query SearchBook {
searchbook {
 bookPhoto
 bookName
 bookDescription
 bookAuthor
 likes
}
}
`;

export const USERS = gql`
 query Users {
 users {
    id
    profilePhoto
    fullName
    username
    phoneNumber
    email
    country
    password
    role
    activityStatus
  }
  }
`;

export const USER = gql`
 query User($userId: ID!) {
  user(id: $userId) {
    id
    profilePhoto
    fullName
    username
    phoneNumber
    email
    country
    password
    role
    activityStatus
  }
 }
`;