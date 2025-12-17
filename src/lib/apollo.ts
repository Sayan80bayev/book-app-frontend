import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://book-app:4000/graphql",
});

const authLink = setContext((_, { headers }) => {
  if (typeof window === "undefined") return { headers };
  try {
    const raw = localStorage.getItem("auth");
    const token = raw ? JSON.parse(raw).token : null;
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  } catch (err) {
    console.error("Failed to read token from localStorage:", err);
    return { headers };
  }
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
});