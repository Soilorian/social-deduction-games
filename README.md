# Social Deduction Games

Related browser party-game prototypes built with Node.js, Express and Socket.IO. Each application manages player roles and private information on the server and updates connected browser clients.

## Applications

- `apps/word-role`: the Ubuntu Avalon/word-role variant.
- `apps/spy-two-word`: the separate Ubuntu spy variant.
- `tools`: the supplied role-generation utilities.

The variants remain separate applications because their role and word rules differ.

## Use

In one application directory, run `npm ci`. Set `MANAGER_PASSWORD` in the shell environment, then run `node server.js`. Follow the supplied application README for the original rules. Never commit your password. On Ubuntu, start with `MANAGER_PASSWORD='your-private-value' node server.js`.

## Scope

The game code is the supplied final implementation; only embedded manager credentials were replaced with required environment settings for publication. This remains prototype shared-password access control. No application or test suite was run. Existing application READMEs are retained as historical documentation and may describe the old configuration.
