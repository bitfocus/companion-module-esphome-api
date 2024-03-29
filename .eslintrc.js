module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: [
		'@typescript-eslint',
		'prettier'
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	ignorePatterns: [
		'.eslintrc.js',
		'dist',
		'src/proto/*.*'
	],
	rules: {
		'@typescript-eslint/no-unused-vars': ['warn', { "argsIgnorePattern": "^_" }]
	}
};