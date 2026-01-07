# Observations Feature - Quick Testing Guide

## Prerequisites
1. MongoDB running and connected
2. Backend server running on port 8000
3. Frontend running on port 5173
4. At least one admin user and one maintenance staff user created
5. At least one maintenance task assigned to a maintenance staff member

## Test Scenarios

### Scenario 1: Maintenance Staff Adds Text Observation

**Steps:**
1. Login as maintenance staff user
2. Navigate to Dashboard
3. Currently, defects are being used as tasks - we need to access via `/maintenance/tasks/:taskId`
4. Click "Add Observation" button
5. Enter text: "Found additional cracks on panel B-12 nearby"
6. Click "Save Observation"
7. Verify observation appears in the list with your name and timestamp

**Expected Result:**
- Observation saved successfully
- Toast notification shows "Observation added successfully"
- Observation appears in the list immediately
- Author name and timestamp are displayed

### Scenario 2: Maintenance Staff Uploads Images

**Steps:**
1. Login as maintenance staff user
2. Navigate to a task detail page
3. Click "Add Observation"
4. Click "Choose Images" and select 2-3 images
5. Verify images appear in preview
6. Click "Upload X image(s)"
7. Wait for upload to complete (green checkmark appears)
8. Add optional text
9. Click "Save Observation"

**Expected Result:**
- Images preview correctly before upload
- Upload progress is shown
- Uploaded images show green checkmark
- Observation saves with both text and images
- Images are viewable in the observation card

### Scenario 3: Admin Views Observations

**Steps:**
1. Login as admin user
2. Navigate to "Maintenance Tasks" from sidebar
3. Verify you see list of maintenance tasks
4. Find a task with observations (shows count)
5. Click "View Observations" button
6. Review all observations on the task
7. Test filtering by author

**Expected Result:**
- All observations are visible
- Images load and can be clicked to open in new tab
- Author filter works correctly
- Statistics show correct counts

### Scenario 4: Multiple Observations

**Steps:**
1. Login as maintenance staff
2. Add 3 different observations:
   - One with text only
   - One with images only
   - One with both text and images
3. Logout and login as different maintenance staff (if assigned to same task)
4. Add another observation
5. Login as admin
6. View all observations and verify all are visible

**Expected Result:**
- All observations from different staff members are visible
- Each observation shows correct author
- Filter by author works to show only specific staff's observations

### Scenario 5: Edit/Delete Observation

**Steps:**
1. Login as maintenance staff
2. Navigate to task with your observations
3. Try to delete your own observation
4. Confirm deletion
5. Try to delete another staff's observation (should not see delete button)

**Expected Result:**
- Can delete own observations
- Cannot delete other users' observations
- Deletion confirmation dialog appears
- Observation removed from list after confirmation

## API Testing (Using Postman or curl)

### 1. Add Observation (POST)
```bash
POST http://localhost:8000/api/maintenance/:taskId/observations
Headers: Authorization: Bearer <token>
Body: {
  "text": "Found cracks on adjacent panel",
  "images": []
}
```

### 2. Get Observations (GET)
```bash
GET http://localhost:8000/api/maintenance/:taskId/observations
Headers: Authorization: Bearer <token>
```

### 3. Upload Images (POST)
```bash
POST http://localhost:8000/api/maintenance/observations/upload
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data
Body: images (file array)
```

### 4. Update Observation (PUT)
```bash
PUT http://localhost:8000/api/maintenance/:taskId/observations/:observationId
Headers: Authorization: Bearer <token>
Body: {
  "text": "Updated observation text"
}
```

### 5. Delete Observation (DELETE)
```bash
DELETE http://localhost:8000/api/maintenance/:taskId/observations/:observationId
Headers: Authorization: Bearer <token>
```

## Edge Cases to Test

### 1. Empty Observation
- Try submitting without text and images
- **Expected:** Error message "Please add text or images to the observation"

### 2. Large Text
- Try entering more than 1000 characters
- **Expected:** Database validation error

### 3. Large Image
- Try uploading image larger than 100MB
- **Expected:** Upload error message

### 4. Invalid File Type
- Try uploading non-image file (e.g., PDF, DOC)
- **Expected:** File type validation error

### 5. Unauthorized Access
- Try accessing task observations you're not assigned to
- **Expected:** 403 Forbidden error

### 6. Multiple Images
- Upload 10 images at once
- **Expected:** All images upload successfully and display in observation

### 7. Network Interruption
- Start image upload and disconnect network
- **Expected:** Error message, can retry upload

## Database Verification

Check MongoDB directly to verify data is stored correctly:

```javascript
// Check observations in a task
db.maintenancetasks.findOne(
  { _id: ObjectId("task_id_here") },
  { observations: 1 }
)

// Check if images array is populated
db.maintenancetasks.aggregate([
  { $unwind: "$observations" },
  { $unwind: "$observations.images" },
  { $group: { 
    _id: null, 
    totalImages: { $sum: 1 } 
  }}
])
```

## Performance Testing

### Load Test
1. Add 50 observations to a single task
2. Open observations page
3. Verify page loads quickly
4. Test filtering performance

### Image Load Test
1. Add 20 observations with 3 images each
2. Open observations page
3. Verify images load progressively
4. Check network tab for image loading

## Known Limitations

1. **Image Size:** Currently set to 100MB max, consider reducing to 10MB for production
2. **No Compression:** Images are stored as-is, consider adding compression
3. **No Thumbnails:** Full images are displayed, consider generating thumbnails
4. **Pagination:** Observations list is not paginated yet, may be slow with 100+ observations

## Success Criteria

- ✅ Maintenance staff can add text observations
- ✅ Maintenance staff can upload images
- ✅ Admin can view all observations
- ✅ Images are stored and retrievable
- ✅ Authorization works correctly
- ✅ UI is responsive and intuitive
- ✅ No console errors
- ✅ Data persists in database

## Troubleshooting

### Issue: Images not uploading
**Check:**
- Backend uploads directory exists and is writable
- Multer configuration in server.js
- File size limits
- Network connection

### Issue: Observations not appearing
**Check:**
- MongoDB connection
- Task ID is correct
- User is authenticated
- Browser console for errors

### Issue: 403 Forbidden errors
**Check:**
- User role (admin or maintenance_staff)
- Task assignment (staff must be assigned to task)
- JWT token is valid

### Issue: Images not displaying
**Check:**
- Image URL format (should be `/uploads/filename`)
- Backend static file serving
- File exists in uploads directory
- CORS configuration

## Next Steps After Testing

1. Fix any bugs found during testing
2. Optimize image upload (add compression)
3. Add pagination for observations list
4. Implement real-time notifications
5. Add analytics dashboard for observation patterns
6. Consider mobile app integration
