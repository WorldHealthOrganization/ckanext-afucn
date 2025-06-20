[![Tests](https://github.com/blagojabozinovski/ckanext-afucn/workflows/Tests/badge.svg?branch=main)](https://github.com/blagojabozinovski/ckanext-afucn/actions)

# ckanext-afucn

Main CKAN theme for the open data portal of the  World Health Organization Afro region 


## Requirements


Compatibility with core CKAN versions:

| CKAN version    | Compatible?   |
| --------------- | ------------- |
| 2.8             | not tested    |
| 2.9             | not tested    |
| 2.10            | Yes           |
| 2.11            | not tested    |


## Installation

To install ckanext-afucn:

1. Activate your CKAN virtual environment, for example:

     . /usr/lib/ckan/default/bin/activate

2. Clone the source and install it on the virtualenv

    git clone https://github.com/blagojabozinovski/ckanext-afucn.git
    cd ckanext-afucn
    pip install -e .
	pip install -r requirements.txt

3. Add `afucn` to the `ckan.plugins` setting in your CKAN
   config file (by default the config file is located at
   `/etc/ckan/default/ckan.ini`).

4. Restart CKAN. For example if you've deployed CKAN with Apache on Ubuntu:

     sudo service apache2 reload


## Config settings

Automatic creation of map subresource after tabular resource creation:

	# Create the subresource setting
	# Default is False
	ckanext.afucn.subresource = True/False

Google Tag ID setting

	# Google Tag ID 
	ckanext.afucn.gtag = google_tag_id


## Developer installation

To install ckanext-afucn for development, activate your CKAN virtualenv and
do:

    git clone https://github.com/blagojabozinovski/ckanext-afucn.git
    cd ckanext-afucn
    python setup.py develop
    pip install -r dev-requirements.txt


## Tests

To run the tests, do:

    pytest --ckan-ini=test.ini


## Releasing a new version of ckanext-afucn

If ckanext-afucn should be available on PyPI you can follow these steps to publish a new version:

1. Update the version number in the `setup.py` file. See [PEP 440](http://legacy.python.org/dev/peps/pep-0440/#public-version-identifiers) for how to choose version numbers.

2. Make sure you have the latest version of necessary packages:

    pip install --upgrade setuptools wheel twine

3. Create a source and binary distributions of the new version:

       python setup.py sdist bdist_wheel && twine check dist/*

   Fix any errors you get.

4. Upload the source distribution to PyPI:

       twine upload dist/*

5. Commit any outstanding changes:

       git commit -a
       git push

6. Tag the new release of the project on GitHub with the version number from
   the `setup.py` file. For example if the version number in `setup.py` is
   0.0.1 then do:

       git tag 0.0.1
       git push --tags

## License

[AGPL](https://www.gnu.org/licenses/agpl-3.0.en.html)
