# Rolling Rick

## Requirements

### Environment variables

All necessary environment variables values can be found in PLAYT's Bitwarden vault.
Create a `.env.local` file in the repo root with the contents of the Bitwarden entry.
Then add an API_KEY according to the FunFair platform instructions.

## Build game

The game is built with TypeScript and Phaser. To build the game, run the following command:

```
npm run build
```

or run in watch mode with:

```
npm run dev
```

The source files are under the `src/game` directory. The game JavaScript files are built in the `game` directory (like `game.js`).
