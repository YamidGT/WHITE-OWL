import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { store } from "./app/store";
import router from "./app/router";
import graphqlClient from "./services/graphqlClient";
import "./styles/global.css";

function App() {
  return (
    <Provider store={store}>
      <ApolloProvider client={graphqlClient}>
        <RouterProvider router={router} />
      </ApolloProvider>
    </Provider>
  );
}

export default App;
