# Rallina Dashboard

This project is a React application with Firebase backend integration. It provides a comprehensive dashboard for fashion e-commerce management with features like order management, inventory control, and user authentication.

The frontend was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and uses Material UI for the user interface components.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the React application in development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.
You may also see any lint errors in the console.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


Good progress so far. Needs some visual tweaks I can suggest:

1. The sidebar menu is visible without even logging in. Login should only ask for username and password
2. The add items is good, covers the sizes, categories, etc. We will provide proper raw data later on, good work on this. 
3. Classifying orders is very nice. I noticed, however, that cancelled orders don't result in a negative balance. Yani k wo balance -$30 show nhin hota. Umeed hai k backend par cancelled orders refund policy ko match karein gay. (Will update you later on this). 
4. For profile, keep in mind we might need different levels. Like someone who does inventory only, someone who manages everything (admin), etc. Aik hi shop hai ye, marketplace scene nahin hai Rallina. 
5. Baqi inventory add or deduction will depend on further testing, k jab kuch order hota hai to peche se stock mein deduction hoti hai ya nhin. But I like what you've done so far.
Aik aur additional point hai, give the option to match colors to images for the item listing. It will impress the clients. For example, mein aik item add karta hoon jo k black, white aur pink mein hai. Aur saath colors bhi select kardeta hoon neche options se. To jab website par koi click karta hai pink ko, to automatically uss item ki pink image show hojati hai from the selected gallery of the product. Can you do that?