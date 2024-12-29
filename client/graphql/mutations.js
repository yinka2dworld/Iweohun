import { gql } from '@apollo/client';

export const LOGIN = gql`
mutation Login($loginuser: loginInput!){
  login(loginuser: $loginuser) {
    username,
    password
  }
}
`; 

export const SIGNUP = gql`
  mutation Signup($adduser: signupInput!) {
    signup (adduser: $adduser) {
  profilePhoto,
  fullName,
   username,
   phoneNumber,
   email,
   password,
    }
  }
`;

export const UPLOADFILE = gql`
mutation UploadFile($file: Upload!) {
  uploadFile(file: $file) {
    url
  }
}
`;

export const ADDBOOK = gql`
mutation AddBook($addbook: addBookInput!) {
  addBook(addbook: $addbook) {
    id
    bookPhoto
    bookName
    bookAuthor
    bookDescription
    audioBook
    likes
  }
}
`;

export const DELETEBOOK = gql`
 mutation DeleteBook($deleteBookId: ID!) {
  deleteBook(id: $deleteBookId) {
    id
    bookPhoto
    bookName
    bookDescription
    bookAuthor
    likes
  }
}
`;

export const UPDATEBOOK = gql`
 mutation UpdateBook($updateBookId: ID!, $updatebook: updateBookInput!) {
  updateBook(id: $updateBookId, updatebook: $updatebook) {
    id
    bookPhoto
    bookName
    bookDescription
    bookAuthor
    likes
  }
}
`;

export const UPDATEUSER = gql`
 mutation UpdateUser($updateUserId: ID!, $updateuser: updateUserInput!) {
  updateUser(id: $updateUserId, updateuser: $updateuser) {
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

