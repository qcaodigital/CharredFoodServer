const express = require('express');
const router = express.Router();
const MenuItems = require('../../models/menu-item.js');
const Categories = require('../../models/menu-category.js');

router.get('/all-items', (req, res) => {
	MenuItems.find({}, (err, allItems) => {
		if (err) return res.send(err);
		res.send(allItems);
	});
});

router.get('/all-categories', (req, res) => {
	Categories.find({}, (err, allCategories) => {
		if (err) return res.send(err);
		res.send(allCategories);
	});
});

router.post('/add-item', (req, res) => {
	Categories.findOne(
		{ name: new RegExp(`(?:^|W)${req.body.category}(?:$|W)`, 'i') },
		(err, category) => {
			if (err) return res.send(err);
			if (!category) {
				console.error(`Category '${req.body.category}' does not exist`);
				return res.send(`Category '${req.body.category}' does not exist`);
			}

			//Check for duplicate item name
			MenuItems.findOne(
				{ name: new RegExp(`(?:^|W)${req.body.name}(?:$|W)`, 'i') },
				(err, duplicateItem) => {
					if (err) return res.send(err);
					if (duplicateItem) {
						console.log(
							`Unable to add item: Duplicate item name '${duplicateItem.name}'`
						);
						return res.send(`Item name ${req.body.name} already exists`);
					}

					//Add item to items collection
					MenuItems.create(
						{ ...req.body, category: category._id, name: req.body.name },
						(err, newItem) => {
							if (err) return res.send(err);

							//Insert item_id into corresponding category's item array
							category.items = [...category.items, newItem._id];
							category.save();

							res.send(`Created item ${newItem.name}`);
						}
					);
				}
			);
		}
	);
});

router.post('/delete-item', async (req, res) => {
	MenuItems.findOneAndDelete(
		//Find and delete one item that matches the query that is either the item's name or _id
		{
			$or: [
				{ name: new RegExp(`(?:^|W)${req.body.name}(?:$|W)`, 'i') },
				{ _id: req.body._id },
			],
		},
		(err, deletedItem) => {
			if (err) return res.send(err);
			if (!deletedItem) {
				if (req.body.name) {
					console.log(`Item '${req.body.name}' does not exist`);
					return res.send(`Item '${req.body.name}' does not exist`);
				}
				if (req.body._id) {
					console.log(`Item with the _id '${req.body._id}' does not exist`);
					return res.send(`Item with the _id '${req.body._id}' does not exist`);
				}
			}

			//Find the deleted item's category
			Categories.findOne({ _id: deletedItem.category }, (err, deletedItemsCategory) => {
				if (err) return res.send(err);

				//Remove item_id from category's item list
				deletedItemsCategory.items = deletedItemsCategory.items.filter(
					(item) => !item._id.equals(deletedItem._id)
				);

				deletedItemsCategory.save();
				res.send(`Deleted ${deletedItem.name}`);
			});
		}
	);
});

router.post('/add-category', (req, res) => {
	Categories.findOne(
		{ name: new RegExp(`(?:^|W)${req.body.name}(?:$|W)`, 'i') },
		(err, category) => {
			//Check if category name already exists
			if (category) return res.send(`Category ${req.body.name} already exists`);

			//Create category
			new Categories(req.body).save();

			return res.send(`New category "${req.body.name}" created.`);
		}
	);
});

router.post('/delete-category', (req, res) => {
	Categories.findOne(
		{ name: new RegExp(`(?:^|W)${req.body.name}(?:$|W)`, 'i') },
		(err, category) => {
			//Check if the category search query exists
			if (err) return res.send(err);
			if (!category) {
				if (req.body.name) return res.send(`Category ${req.body.name} does not exist`);
				if (req.body._id) return res.send(`Category ${req.body._id} does not exist`);
			}
			if (category.items.length > 0)
				return res.send('Category item list must be empty before deleting');

			//Remove category
			category.remove();
			res.send(`Removed category: ${category.name}`);
		}
	);
});

router.get('/categoryitems', (req, res) => {
	Categories.findOne({
		$or: [{ name: new RegExp(`(?:^|W)${req.body.name}(?:$|W)`, 'i') }, { _id: req.body._id }],
	})
		.populate('items')
		.exec((err, category) => {
			//Check if the category search query exists
			if (err) return res.send(err);
			if (!category) return res.send(`Category ${req.body.name} does not exist`);

			res.send(category.items);
		});
});

module.exports = router;
