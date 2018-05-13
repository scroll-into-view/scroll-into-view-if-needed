# Run tests

You'll need two terminal sessions for this.

1. Install deps `yarn`
2. Start the server: `yarn start`
3. In the other session: `yarn test`

You can also open http://localhost:3000 in the browser to run the tests.

# Why are tests setup like this?

Two reasons.

1. It helps with staying in sync with the same tests that browsers run when checking if they are implementing the spec correctly.
2. Easier to run tests in different browsers, compared to if a more conventional cypress or jest setup were used.

## How tests are kept in sync with w3c

The `resources` and `css` folders are rougly equivalent with their counterparts on here: https://github.com/w3c/web-platform-tests

Except that anything that isn't needed to run the tests related to `scrollIntoView` is stripped out.
