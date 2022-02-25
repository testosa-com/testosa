import clsx from 'clsx';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import autoTestGenSvg from '../../static/img/undraw_docusaurus_mountain.svg';
import powerfulSvg from '../../static/img/undraw_docusaurus_react.svg';
import convenientSvg from '../../static/img/undraw_docusaurus_tree.svg';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
  {
    description: (
      <>
        Testosa reads your OpenAPI description, fuzzes data, and generate tests
        for each of your endpoints, validating that the responses confirm to
        your defined API specification.
        <p>
          <br />
          <a className="button" href="/docs/introduction/getting-started">
            Read more
          </a>
        </p>
      </>
    ),
    Svg: autoTestGenSvg,
    title: 'Automatic test generation'
  },
  {
    description: (
      <>
        For any project, run your tests via the CLI. For JavaScript projects,
        you may also control Testosa execution through JavaScript modules.
        <p>
          <br />
          <a className="button" href="/docs/introduction/getting-started">
            Read more
          </a>
        </p>
      </>
    ),
    Svg: convenientSvg,
    title: 'Convenient'
  },
  {
    description: (
      <>
        Testosa provides a hooks interface to Tap into test operations and
        optionally perform actions before or after all and each endpoint test.
        <p>
          <br />
          <a className="button" href="/docs/introduction/getting-started">
            Read more
          </a>
        </p>
      </>
    ),
    Svg: powerfulSvg,
    title: 'Powerful'
  }
];

// eslint-disable-next-line no-unused-vars
const Feature = ({ Svg, title, description }) => (
  <div className={clsx('col col--4')}>
    <div className="text--center">
      <Svg className={styles.featureSvg} alt={title} />
    </div>
    <div className="text--center padding-horiz--md">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
