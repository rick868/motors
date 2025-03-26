const { storage } = require('./storage');

async function testGetUserByUsername() {
    const username = 'jay'; // Replace with an actual username to test
    const user = await storage.getUserByUsername(username);
    console.log(user);
}

testGetUserByUsername();
