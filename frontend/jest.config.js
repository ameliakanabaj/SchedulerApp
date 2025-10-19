module.exports = {
    preset: 'jest-preset-angular',
    testEnvironment: 'jsdom',

    transform: {
        '^.+\\.(ts|mjs|js|html)$': 'jest-preset-angular',
    },

    moduleNameMapper: {
        '\\.(html|scss|css)$': 'identity-obj-proxy',
    },

    transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],

    moduleFileExtensions: ['ts', 'html', 'js', 'json'],
};
