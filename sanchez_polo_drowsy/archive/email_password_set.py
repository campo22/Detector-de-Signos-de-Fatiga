import keyring

# to show the set password
print(keyring.get_password("yagmail", "your_email"))

# to change to the current password
keyring.set_password("yagmail", "your_email", "new_password")

# to delete password
keyring.delete_password("yagmail", "your_email")
