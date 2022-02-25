module.exports = {
  branches: ['+([0-9])?(.{+([0-9]),x}).x', 'master'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          {
            release: 'patch',
            type: 'docs'
          },
          {
            release: 'patch',
            scope: 'deps',
            type: 'build'
          },
          {
            release: 'patch',
            scope: 'deps-dev',
            type: 'build'
          }
        ]
      }
    ],
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/github',
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md', 'package.json', 'package-lock.json'],
        message:
          // eslint-disable-next-line no-template-curly-in-string
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};
