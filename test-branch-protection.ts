// Test file to verify branch protection blocks Vercel deployment
// This file has TypeScript errors that should fail QA checks
const invalidType: string = 456; // Type error: number assigned to string
const anotherError: boolean = 'not a boolean'; // Type error
export default invalidType;
