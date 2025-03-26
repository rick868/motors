import { storage } from './storage';

async function testGetUserByUsername() {
    const username = 'test_username'; // Replace with an actual username to test
    const user = await storage.getUserByUsername(username);
    console.log(user);
}

testGetUserByUsername();
