import React, { Suspense } from "react";
import { Route, Routes as Router, BrowserRouter } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async"; // quản lý các thẻ trong <head>

import Loading from "../components/Loading/Loading";

import MainLayout from "../layout/MainLayout/MainLayout";

import { publicRoutes } from "../constants/paths";


const helmetContext = {};

export const Routes = () => {
  return (
    <BrowserRouter>
      <HelmetProvider context={helmetContext}>
        <Helmet>
          <meta charSet="utf-8" />
          <title>Sound Hub</title>
          <link rel="canonical" href="https://www.tacobell.com/" />
        </Helmet>
        <Suspense fallback={<Loading />}>
          <Router>
            {publicRoutes.map((route, index) => {
              const Layout = route?.layout || MainLayout;
              const Page = route?.component;
              return (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    <Layout>
                        <Page/>
                    </Layout>
                  }
                />
              );
            })}
          </Router>
        </Suspense>
      </HelmetProvider>
    </BrowserRouter>
  );
};
