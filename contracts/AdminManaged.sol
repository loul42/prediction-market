pragma solidity ^0.4.2;

contract AdminManaged {

	mapping (address => bool) public administratorsMap;
	mapping (address => bool) public trustedSources;
	address public owner;

	event LogAdminAdded(address sender, address admin);
	event LogAdminRemoved(address sender, address admin);
	event LogTrustedSourceAdded(address sender, address trustedSource);
	event LogTrustedSourceRemoved(address sender, address trustedSource);

	function AdminManaged(){
		owner = msg.sender;
		administratorsMap[msg.sender] = true;
		trustedSources[msg.sender] = true;
	}

	// Modifiers

	modifier onlyAdmin{
		require(isAdmin(msg.sender));
		_;
	}

	modifier onlyOwner{
		require(msg.sender == owner);
		_;
	}

	modifier onlyTrustedSource{
		require(isTrustedSource(msg.sender));
		_;
	}

	// Trusted Sources management

	function addTrustedSource(address trustedSource)
		public
		onlyAdmin
		returns(bool success)
	{
		trustedSources[trustedSource] = true;
		LogTrustedSourceAdded(msg.sender, trustedSource);
		return true;
	}

	function removeTrustedSource(address trustedSource)
		public
		onlyAdmin
		returns(bool success)
	{
		require(trustedSource != owner);
		trustedSources[trustedSource] = false;
		LogTrustedSourceRemoved(msg.sender, trustedSource);
		return true;
	}

	function isTrustedSource(address trustedSource)
		public
		returns(bool isIndeed)
	{
		return trustedSources[trustedSource];
	}

	// Admin management

	function addAdmin(address admin)
		public
		onlyOwner
		returns(bool adminAdded)
	{
		administratorsMap[admin] = true;
		LogAdminAdded(msg.sender, admin);
		return true;
	}

	function removeAdmin(address admin)
		public
		onlyOwner
		returns(bool adminDeleted)
	{
		administratorsMap[admin] = false;
		LogAdminRemoved(msg.sender, admin);
		return true;
	}

	function isAdmin(address admin)
		public
		returns(bool isIndeed)
	{
		return administratorsMap[admin];
	}

}