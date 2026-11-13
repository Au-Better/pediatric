# Au Better Studio

The content editor for aubetter.org, hosted at https://aubetter.sanity.studio.

- Content types are in `src/schemaTypes/`.
- After changing anything in this folder, update the hosted Studio:

  ```sh
  cd ~/Documents/pediatric && git pull && cd studio && npx sanity deploy
  ```

See the main `README.md` one folder up for how the whole site fits together.
