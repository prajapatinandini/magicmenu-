const express = require('express');
const router = express.Router();
const Menu = require('../models/Menuschema');
const Cafe = require('../models/Cafeschema');
const MenuItem = require('../models/Menuitem');
const authMiddleware = require('../middleware/ownerMiddle');
const upload = require('../middleware/multer');


router.post(
  '/cafes/:cafeId/menu',
  authMiddleware,
  upload.array('images'),
  async (req, res) => {
    try {
      const { cafeId } = req.params;
      const categories = JSON.parse(req.body.categories);
      const uploadedFiles = req.files;

      const cafe = await Cafe.findById(cafeId);
      if (!cafe) return res.status(404).json({ error: 'Cafe not found' });
      if (cafe.owner.toString() !== req.user.id) {
        return res.status(403).json({
          error: 'You are not allowed to create a menu for this cafe.'
        });
      }

      const newCategories = [];

      for (let cat of categories) {
        const newCat = {
          name: cat.name,
          description: cat.description || '',
          items: [],
          subCategories: []
        };

        // 🔁 Main category items
        for (let item of cat.items || []) {
          const imageFile = uploadedFiles.find(f => f.originalname === item.imageName);
          console.log('Uploaded files:', uploadedFiles.map(f => f.originalname));

          if (!imageFile) {
            return res.status(400).json({
              error: `Missing image file for main category item "${item.name}". Expected image name: "${item.imageName}".`
            });
          }

          const menuItem = new MenuItem({
            name: item.name,
            description: item.description,
            price: item.price,
            image: `/uploads/${imageFile.filename}`,
            category: cat.name,
            subCategory: null,
            isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
            tags: item.tags || [],
            customizations: item.customizations || []
          });
          await menuItem.save();
          newCat.items.push(menuItem._id);
        }

        // Subcategories
        for (let subCat of cat.subCategories || []) {
          const newSubCat = {
            name: subCat.name,
            description: subCat.description || '',
            items: []
          };

          for (let item of subCat.items || []) {
            const imageFile = uploadedFiles.find(f => f.originalname === item.imageName);
            console.log('Uploaded files:', uploadedFiles.map(f => f.originalname));

            if (!imageFile) {
              return res.status(400).json({
                error: `Missing image file for subcategory item "${item.name}". Expected image name: "${item.imageName}".`
              });
            }

            const menuItem = new MenuItem({
              name: item.name,
              description: item.description,
              price: item.price,
              image: `/uploads/${imageFile.filename}`,
              category: cat.name,
              subCategory: subCat.name,
              isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
              tags: item.tags || [],
              customizations: item.customizations || []
            });
            await menuItem.save();
            newSubCat.items.push(menuItem._id);
          }

          newCat.subCategories.push(newSubCat);
        }

        newCategories.push(newCat);
      }

      const newMenu = new Menu({
        cafe: cafeId,
        categories: newCategories
      });

      await newMenu.save();

      return res.status(201).json({ message: 'Menu created successfully', menu: newMenu });
    } catch (err) {
      console.error('Menu creation error:', err);
      return res.status(500).json({ error: 'Server error', details: err.message });
    }
  }
);


router.get('/cafes/:cafeId/menu', async (req, res) => {
  try {
    const menu = await Menu.findOne({ cafe: req.params.cafeId })
      .populate('categories.items')
      .populate('categories.subCategories.items');

    if (!menu) {
      return res.status(404).json({ error: 'Menu not found' });
    }

    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});



router.put('/cafes/:cafeId/menu', authMiddleware, async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { categories } = req.body;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) return res.status(404).json({ error: 'Cafe not found' });
    if (cafe.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedMenu = await Menu.findOneAndUpdate(
      { cafe: cafeId },
      { categories, lastUpdated: new Date() },
      { new: true, upsert: true }
    );

    res.json({ message: 'Menu updated', menu: updatedMenu });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});



router.post('/menu/items', authMiddleware, async (req, res) => {
  try {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.status(201).json({ message: 'Item created', item: newItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item', details: err.message });
  }
});



router.put('/menu/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.itemId,
      req.body,
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item updated', item: updatedItem });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});



router.delete('/menu/items/:itemId', authMiddleware, async (req, res) => {
  try {
    const deletedItem = await MenuItem.findByIdAndDelete(req.params.itemId);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});




module.exports = router;
