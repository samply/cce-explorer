clean:
    rm -rf .svelte-kit build

beautify:
    npm run lint
    npm run format

build:
    npm run build

run: clean build
    npm run dev

# beautify-run: clean beautify build
#     npm run dev