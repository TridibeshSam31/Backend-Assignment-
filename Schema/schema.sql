/*
users table will have below fields
  id
  username
  password
  created_at

bookings table will have below fields
  id
  user_id
  car_name
  days
  rent_per_day
  status  // ('booked', 'completed', 'cancelled')
  created_at

Nothing above can be null
*/

CREATE TABLE users(
    id SERIAL primary key,
    username VARCHAR(50) NOT NULL ,
    password VARCHAR(25) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
);

CREATE TABLE bookings (
    id SERIAL primary key,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    car_name VARCHAR(100) NOT NULL,
    days INT NOT NULL,
    rent_per_day FLOAT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK(status IN ('booked', 'completed', 'cancelled')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);