/*

## POST `/bookings`

### Description

Create a booking only for the loggedin user

Request Body

{
"carName":"Honda City",
"days":3,
"rentPerDay":1500
}


Success Response — 201
{
success: true
data: {
"message":"Booking created successfully",
"bookingId":101,
"totalCost":4500
}
}

### Business Rules

- `status` is always `"booked"` on creation
- `totalCost = days × rentPerDay`
- days should be less than 365 else “invalid inputs” error with 400
- rent per day cannot be more than 2000 else same as above


Edge Cases & Errors

| Status | Error |
| --- | --- |
| 400 | invalid inputs |



## GET `/bookings`

### Description

Fetch bookings only for logged in user

### Query Parameters

- `bookingId` → fetch single booking
- `summary=true` → fetch booking summary



Normal Response — 200

{
success: true
data: [
{
"id":101,
"car_name":"Honda City",
"days":3,
"rent_per_day":1500,
"status":"booked",
"totalCost":4500
}
]
}

### Summary Response — `200`

{
success: true
data: {
"userId":1,
"username":"rahul",
"totalBookings":3,
"totalAmountSpent":6300
}
}

### Rules

- Count only `booked` and `completed`
- Ignore `cancelled`



### Edge Cases & Errors


Status	Error
404	bookingId not found

PUT /bookings/:bookingId 

### Description

Update booking details or status

(Only **owner** can update)


Request Body (Update Details)
{
"carName":"Verna",
"days":4,
"rentPerDay":1600
}

OR (Update Status Only)
{
"status":"completed"
}


Success Response — 200
{
success: true,
data: {
"message":"Booking updated successfully",
"booking":{
"id":101,
"car_name":"Verna",
"days":4,
"rent_per_day":1600,
"status":"completed",
"totalCost":6400
}
}
}

Edge Cases & Errors

| Status | Error |
| --- | --- |
| 403 | booking does not belong to user |
| 404 | booking not found |
| 400 | invalid inputs |

DELETE /bookings/:bookingId
### Description

Delete a booking owned by the logged-in user

Success Response — 200

{
success: true,
data: {
"message":"Booking deleted successfully"
}
}

Edge Cases & Errors

Status	Error
403	booking does not belong to user
404	booking not found

*/


import connectdb from "../config/db";


//create booking 
export const createBookingForLoginCustomer = async (res,req) => {
    try {
        //our response should look like this
        /*
        {
       "carName":"Honda City",
        "days":3,
      "rentPerDay":1500
        }
        
        
        */
       const {carName,days,rentPerDay} = req.body
       const userId = req.user.userId
       //checking if the user is logined or not


       if (!userId) {
         
         return res.status(400).json({
            success:false,
            error:"user not found"
         }) 
       }

       if (!carName||!days||!rentPerDay) {
        return res.status(400).json({
            success:false,
            error:"Invalid Input"
        })

       }

       //no of days should not be greater than 365 days and less than 0
       if (days>=365 || days<=0) {
        return res.status(400).json({
            success:false,
            error:"Invalid Inputs"
        })
       }

       //rent cannon exceed 2000
       if (rentPerDay >2000 || rentPerDay<=0) {
        return res.status(400).json({
            success:false,
            error:"Invalid Inputs"
        })
       }


       //calculate total cost
       const totalCost = days*rentPerDay

       //save into db with total cost and send final response
        const result = await pool.query(
      `INSERT INTO bookings (user_id, car_name, days, rent_per_day, status) 
       VALUES ($1, $2, $3, $4, 'booked') 
       RETURNING id`,
      [userId, carName, days, rentPerDay]
      );

       res.status(201).json({
      success: true,
      data: {
        message: 'Booking created successfully',
        bookingId: result.rows[0].id,
        totalCost: totalCost
      }
       });
    } catch (error) {
        console.log("error in creating booking")
        res.status(500).json({
            success:false,
            error:"Internal Server Error"
        })
        
    }



}


//get bookings

export const getBookings = async (req,res) => {
   try {
     const {bookingId ,summary} = req.query()
     const {userId} = req.user.userId
 
     //if summary is requested
     if (summary === "true") {
         const result = await pool.query(
            `SELECT 
           u.id as "userId",
           u.username,
           COUNT(b.id) FILTER (WHERE b.status IN ('booked', 'completed')) as "totalBookings",
           COALESCE(SUM(b.days * b.rent_per_day) FILTER (WHERE b.status IN ('booked', 'completed')), 0) as "totalAmountSpent"
          FROM users u
          LEFT JOIN bookings b ON u.id = b.user_id
          WHERE u.id = $1
          GROUP BY u.id, u.username`,
         [userId]
 
         )
         
     
 
 
      return res.status(200).json({
         success: true,
         data: {
           userId: result.rows[0].userId,
           username: result.rows[0].username,
           totalBookings: parseInt(result.rows[0].totalBookings),
           totalAmountSpent: parseFloat(result.rows[0].totalAmountSpent)
         }
      })
 
     }
 
 
     //if specific booking is requested
     if (bookingId) {
         const result = await pool.query(
           `SELECT id, car_name, days, rent_per_day, status, 
             (days * rent_per_day) as total_cost
          FROM bookings 
          WHERE id = $1 AND user_id = $2`,
         [bookingId, userId]
         )
     
 
      if (result.rows.length === 0) {
         return res.status(404).json({
           success: false,
           error: 'bookingId not found'
         });
       }
 
        return res.status(200).json({
         success: true,
         data: [{
           id: result.rows[0].id,
           car_name: result.rows[0].car_name,
           days: result.rows[0].days,
           rent_per_day: parseFloat(result.rows[0].rent_per_day),
           status: result.rows[0].status,
           totalCost: parseFloat(result.rows[0].total_cost)
         }]
       });
 
     }
 
    //get all bookings by user
     const result = await pool.query(
       `SELECT id, car_name, days, rent_per_day, status,
               (days * rent_per_day) as total_cost
        FROM bookings 
        WHERE user_id = $1
        ORDER BY created_at DESC`,
       [userId]
     );
 
     const bookings = result.rows.map(row => ({
       id: row.id,
       car_name: row.car_name,
       days: row.days,
       rent_per_day: parseFloat(row.rent_per_day),
       status: row.status,
       totalCost: parseFloat(row.total_cost)
     }));
 
     res.status(200).json({
       success: true,
       data: bookings
     });
   } catch (error) {
     return res.status(500).json({
        success:false,
        error:"Internal server Error"
     })
   }










}



export const updateBooking = async (res,req) => {
    try {
        const {bookingId} = req.query
        const userId = req.user.userId
        const { carName, days, rentPerDay, status } = req.body;
    } catch (error) {
        
    }
}