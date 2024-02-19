// index.test.js
const request = require('supertest');
const { app, server } = require('../index');

afterAll((done) => {
  server.close(done);
});

describe('GET /get/sales', () => {

    it('should return 400 when accountID is not provided', async () => {
        const response = await request(app)
          .get('/get/sales')
          .query({ account: '', type: '' }); // Adjust with actual values
    
        expect(response.status).toBe(400);
        expect(response.body.statusCode).toBe(400);
        expect(response.body.message).toBe('provide required parameter accountID');
      });

    it('should return filtered data based on account and other parameters', async () => {
      const response = await request(app)
        .get('/get/sales')
        .query({ account: '1bb58cfa-063d-4f5c-be5d-b90cfb64d1d6', type: 'customer' }); 
  
      expect(response.status).toBe(200);
      expect(response.body.statusCode).toBe(200);
      expect(response.body.message).toBe('successful');
    //expect(response.body.data).toHaveLength(/* Expected length of all data */);

    });

    it('should handle errors when file is missing', async () => {
         //    Mocking the fs.readFile function to simulate an error
        jest.spyOn(require('fs').promises, 'readFile').mockRejectedValue(new Error('File read error'));
        
        const response = await request(app).get('/get/sales');
        expect(response.status).toBe(500);
        expect(response.text).toContain('Internal Server Error');
    });
    
  
  });
