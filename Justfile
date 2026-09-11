clean:
    rm -rf .svelte-kit build

beautify:
    npm run lint
    npm run format

build:
    npm run build

run: clean beautify build
    npm run dev