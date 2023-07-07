module.exports = {
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            compiler: "ttypescript"
        }],
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    preset: 'ts-jest',
};
