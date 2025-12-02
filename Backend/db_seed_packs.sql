-- DB seed for packs and recruiter_subscriptions (run in recruitment_platform database)
-- Adjust RECRUITER_ID to match an existing recruiter in your DB (e.g. 1)

-- Create packs table if missing
CREATE TABLE IF NOT EXISTS packs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  job_limit INT NOT NULL DEFAULT 0,
  candidate_limit INT NOT NULL DEFAULT 0,
  visibility_days INT NOT NULL DEFAULT 30,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create recruiter_subscriptions table if missing
CREATE TABLE IF NOT EXISTS recruiter_subscriptions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recruiter_id INT NOT NULL,
  pack_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('active','inactive','cancelled','expired') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recruiter_id) REFERENCES recruiters(id) ON DELETE CASCADE,
  FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed packs (id values will be assigned automatically)
INSERT INTO packs (name, price, job_limit, candidate_limit, visibility_days, description)
VALUES
('basic', 0.00, 3, 100, 30, 'Pack de base - 3 offres'),
('standard', 29.99, 10, 500, 30, 'Pack standard - 10 offres'),
('premium', 79.99, 999, 5000, 365, 'Pack premium - offres illimitées');

-- Example: create an active subscription for a recruiter
-- Replace RECRUITER_ID below with the actual recruiter.id present in your `recruiters` table (e.g. 1).
-- After running the packs INSERT, find the pack id you want to use (e.g. standard -> likely id 2).

-- Example (replace RECRUITER_ID and PACK_ID):
-- INSERT INTO recruiter_subscriptions (recruiter_id, pack_id, start_date, end_date, status)
-- VALUES (RECRUITER_ID, PACK_ID, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active');

-- Quick helper: if you want to create a subscription for recruiter_id = 1 using the 'standard' pack:
-- (Uncomment and run after adjusting recruiter id if needed)
--
-- SET @rid = 1; -- replace with your recruiter id
-- SET @packid = (SELECT id FROM packs WHERE name = 'standard' LIMIT 1);
-- INSERT INTO recruiter_subscriptions (recruiter_id, pack_id, start_date, end_date, status)
-- VALUES (@rid, @packid, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'active');

-- End of seed file
