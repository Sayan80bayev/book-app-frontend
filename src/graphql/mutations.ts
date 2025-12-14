import { gql } from "@apollo/client";

// --- MUTATIONS ---
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterUserInput!) {
    registerUser(input: $input) {
      user {
        id
        username
        bio
        birthDate
        nationality
      }
      token
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginUserInput!) {
    loginUser(input: $input) {
      user {
        id
        username
        bio
        birthDate
        nationality
      }
      token
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      title
      description
      icon
      parentCategoryId
    }
  }
`;