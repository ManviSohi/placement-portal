const pool = require('../config/db');


// Models contain ALL database queries.
// No SQL should ever appear in controllers.
const UserModel={
     findByEmail: async (email) => {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    // result.rows is always an array. rows[0] is the first match or undefined.
    return result.rows[0];
},
    findById: async (id) => {
    const query = `
      SELECT id, email, role, created_at 
      FROM users 
      WHERE id = $1
    `;

     const result = await pool.query(query, [id]);
    return result.rows[0];
  },
    create:async({email,passwordHash,role='student'})=>{

    const client=await pool.connect();
    try{
        await client.query('BEGIN');
         const userQuery = `
        INSERT INTO users (email, password_hash, role)
        VALUES ($1, $2, $3)
        RETURNING id, email, role, created_at
      `;
      const userResult = await client.query(userQuery, [email, passwordHash, role]);
      const newUser = userResult.rows[0];
        if (role === 'student') {
        const profileQuery = `
          INSERT INTO student_profiles (user_id)
          VALUES ($1)
        `;
        await client.query(profileQuery, [newUser.id]);
        }
        await client.query('COMMIT');
      return newUser;

    }catch (error) {
      // ROLLBACK undoes everything if anything failed
      await client.query('ROLLBACK');
      throw error; // Re-throw so the controller can handle it
    }
    finally{
        client.release();
    }


    

},
   existsByEmail: async (email) => {
    const query = 'SELECT id FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows.length > 0;
  },
};

module.exports = UserModel;
