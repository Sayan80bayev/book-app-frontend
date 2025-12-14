import { gql } from "@apollo/client";

// --- QUERIES ---
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      username
      bio
      birthDate
      nationality
    }
  }
`;

export const GET_BOOKS = gql`
  query GetBooks {
    books {
      id
      title
      description
      publishYear
      authorId
      categories
    }
  }
`;

export const GET_BOOK = gql`
  query GetBook($id: ID!) {
    book(id: $id) {
      id
      title
      description
      publishYear
      authorId
      categories
    }
  }
`;

export const GET_REVIEWS_BY_BOOK = gql`
  query ReviewsByBook($bookId: ID!) {
    reviewsByBook(bookId: $bookId) {
      id
      bookId
      userId
      rating
      comment
      createdAt
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      title
      description
      icon
      parentCategoryId
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      username
      bio
      birthDate
      nationality
    }
  }
`;



