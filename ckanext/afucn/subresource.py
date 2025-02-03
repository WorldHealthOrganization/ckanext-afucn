import ckan.plugins.toolkit as tk
from ckan.common import g


def create_subresource(context, resource_dict):

    x = tk.get_action("status_show")(context)
    print("======================================================================")
    print(g.user)
    print("======================================================================")
    print(resource_dict)
    print("======================================================================")
    print(x)
    print("======================================================================")

    return
