// eslint-disable-next-line
import Link from '@docusaurus/Link';
// eslint-disable-next-line
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// eslint-disable-next-line
import Layout from '@theme/Layout';
import clsx from 'clsx';
// eslint-disable-next-line
import React from 'react';
// eslint-disable-next-line
import HomepageFeatures from '../components/HomepageFeatures';
import styles from './index.module.css';

// eslint-disable-next-line no-unused-vars
const HomepageHeader = () => {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className="logo-lg" data-reactid="7">
          <a href="/" data-reactid="8">
            <span className="text" data-reactid="9">
              {siteConfig.title}
            </span>
            <span className="cursor" data-reactid="10">
              &nbsp;
            </span>
          </a>
        </div>
        <p>. . . . .</p>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--lg"
            to="/docs/introduction/getting-started"
          >
            Get Started
          </Link>
        </div>
        <br />
        <p className="hero__subtitle">
          Fast, <strong>auto-generated</strong> end-to-end tests to validate
          your backend HTTP API using OpenAPI (formerly Swagger). Testosa reads
          your OpenAPI description and generate tests for each of your endpoints
          and responses defined in your API specification.
        </p>
      </div>
    </header>
  );
};

const Home = () => {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.tagline}`}
      description="Fast, **auto-generated** end-to-end tests to validate your backend
            HTTP API using OpenAPI (formerly Swagger). Testosa reads your
            OpenAPI description and generate tests for each of your endpoints
            and responses defined in your API specification."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
};

export default Home;
