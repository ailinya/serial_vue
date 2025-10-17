# Serial Vue Frontend

This is the Vue frontend for the serial communication application.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

## Building the Executable

To package the application into a single executable, follow these steps:

1.  **Build the frontend:**
    Navigate to the `serial_vue` directory and run:
    ```bash
    npm run build
    ```

2.  **Package the application:**
    From the root directory, run the following command:
    ```bash
    pyinstaller --noconfirm --onefile --windowed --add-data "serial_vue/dist;serial_vue/dist" serial_python/app/main.py
    ```

The executable will be located in the `dist` directory.
