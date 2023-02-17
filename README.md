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

## Testing anti-cheat locally

To test anti-cheat locally and not get 403s from the Anybrain API, copy a match and a user from the database of the live deployed environment that Anybrain hits with their requests to the local database.
Log in as that user locally, go to the playing page and replace the match id query param with the id of the copied match.
The Anybrain requests should succeed now and upload anti-cheat data for that user and match.
Note that this breaks local score submission because of game ID mismatches.
