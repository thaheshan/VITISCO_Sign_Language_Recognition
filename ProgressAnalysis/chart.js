
//On the event scheduler9setup in cloudsql)

//SET GLOBAL event_scheduler = ON;
//SHOW VARIABLES LIKE 'event_scheduler';





// Event to maintain only the 7 days UserXP(Run this once in cloud sql)
// DROP EVENT IF EXISTS delete_old_xp;
// CREATE EVENT delete_old_xp
// ON SCHEDULE EVERY 1 DAY
// DO
// DELETE FROM UserXP WHERE date < CURDATE() - INTERVAL 6 DAY;


//(Run this once in cloud sql)
// CREATE TABLE UserXP (
//     userId INT,
//     date DATE,
//     xpPoints INT,
//     PRIMARY KEY (userId, date),
//     FOREIGN KEY (userId) REFERENCES User(userId)
// );



//Inserts XP points on a daily basis to userxp table

//(Run this once in cloud sql)
// DROP EVENT IF EXISTS update_daily_xp;

// CREATE EVENT update_daily_xp
// ON SCHEDULE EVERY 1 DAY
// STARTS TIMESTAMP(CURDATE(), '23:59:00')
// DO
// INSERT INTO userxp (userId, date, xpPoints)
// SELECT 
//     u.userId, 
//     CURDATE(), 
//     COALESCE(SUM(l.XPPoints), 0) + 
//     COALESCE(SUM(c.XPPoints), 0) + 
//     COALESCE(SUM(q.XPPoints), 0) + 
//     COALESCE(SUM(vc.XPPoints), 0) + 
//     COALESCE(SUM(uq.marksXPPoints), 0) + 
//     COALESCE(SUM(vr.winnerXPPoints), 0)
// FROM 
//     user u
// LEFT JOIN 
//     userlesson ul ON u.userId = ul.userId
// LEFT JOIN 
//     lesson l ON ul.lessonId = l.lessonId
// LEFT JOIN 
//     userchallenge uc ON u.userId = uc.userId
// LEFT JOIN 
//     challenge c ON uc.challengeId = c.challengeId
// LEFT JOIN 
//     userquiz uq ON u.userId = uq.userId
// LEFT JOIN 
//     quiz q ON uq.quizId = q.quizId
// LEFT JOIN 
//     virtualroom vr ON u.userId = vr.hostId
// LEFT JOIN 
//     virtualroomquiz vrq ON vr.roomCode = vrq.roomCode
// LEFT JOIN 
//     quiz vc ON vrq.quizId = vc.quizId
// GROUP BY u.userId
// ON DUPLICATE KEY UPDATE xpPoints = xpPoints + VALUES(xpPoints);






// SELECT DATE_FORMAT(date, '%a') AS day_name, xpPoints
// FROM userxp
// WHERE userId = ?
// ORDER BY date ASC;




app.get('/userXPchart/:userId', (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT day_name, totalXP FROM (
            -- First part: Retrieve XP points from userxp table
            SELECT DATE_FORMAT(date, '%a') AS day_name, xpPoints AS totalXP
            FROM userxp
            WHERE userId = ? 
            ORDER BY date ASC

            UNION ALL

            -- Second part: Retrieve XP points for today from multiple related tables
            SELECT DAYNAME(CURDATE()) AS day_name,  -- Get current day name (Mon, Tue, etc.)
                COALESCE(SUM(l.XPPoints), 0) + 
                COALESCE(SUM(c.XPPoints), 0) + 
                COALESCE(SUM(q.XPPoints), 0) + 
                COALESCE(SUM(vc.XPPoints), 0) + 
                COALESCE(SUM(uq.marksXPPoints), 0) + 
                COALESCE(SUM(vr.winnerXPPoints), 0) AS totalXP
            FROM user u
            LEFT JOIN userlesson ul ON u.userId = ul.userId
            LEFT JOIN lesson l ON ul.lessonId = l.lessonId
            LEFT JOIN userchallenge uc ON u.userId = uc.userId
            LEFT JOIN challenge c ON uc.challengeId = c.challengeId
            LEFT JOIN userquiz uq ON u.userId = uq.userId
            LEFT JOIN quiz q ON uq.quizId = q.quizId
            LEFT JOIN virtualroom vr ON u.userId = vr.hostId
            LEFT JOIN virtualroomquiz vrq ON vr.roomCode = vrq.roomCode
            LEFT JOIN quiz vc ON vrq.quizId = vc.quizId
            WHERE u.userId = ? AND DATE(completionDateTime) = CURDATE()
        ) AS combinedXP
    `;

    db.query(query, [userId, userId], (err, results) => {
        if (err) {
            console.error("Error fetching XP data:", err);
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Extract labels and data for chart
        const labels = results.map(row => row.day_name); 
        const data = results.map(row => row.totalXP);

        // Respond with the formatted data for the front-end chart
        res.json({ labels, datasets: [{ data }] });
    });
});
