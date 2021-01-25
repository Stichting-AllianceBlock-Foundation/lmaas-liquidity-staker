const etherlime = require('etherlime-lib');
const RolesManager = require('../build/RolesManager.json')

describe.only('RolesManager', () => { 

	let aliceAccount = accounts[3];
    let bobAccount = accounts[4];
	let deployer;
	
	let rolesManagerInstance;

	beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(aliceAccount.secretKey);

        rolesManagerInstance = await deployer.deploy(RolesManager, {});
	});
	
	it("should set admin role properly", async() =>  {
		await rolesManagerInstance.setAdminRole([bobAccount.signer.address], true)
		let isBobAdmin = await rolesManagerInstance.isAdmin(bobAccount.signer.address);
		assert.isTrue(isBobAdmin, "Setting admin role failed");
		
		await rolesManagerInstance.setAdminRole([bobAccount.signer.address], false)
		isBobAdmin = await rolesManagerInstance.isAdmin(bobAccount.signer.address);
		assert.isFalse(isBobAdmin, "Setting admin role failed");
	})   

	it("should set operator role properly", async() =>  {
		await rolesManagerInstance.setOperatorRole([bobAccount.signer.address], true)
		let isBobAdmin = await rolesManagerInstance.isOperator(bobAccount.signer.address);
		assert.isTrue(isBobAdmin, "Setting operator role failed");
		
		await rolesManagerInstance.setOperatorRole([bobAccount.signer.address], false)
		isBobAdmin = await rolesManagerInstance.isOperator(bobAccount.signer.address);
		assert.isFalse(isBobAdmin, "Setting operator role failed");
	})   

	it("should fail setting operator role from not owner", async() =>  {
		await assert.revert( rolesManagerInstance.from(bobAccount.signer.address).setOperatorRole([bobAccount.signer.address], true), "Setting operator role not failed");
	})   
	
	it("should fail setting admin role from not owner", async() =>  {
		await assert.revert( rolesManagerInstance.from(bobAccount.signer.address).setAdminRole([bobAccount.signer.address], true), "Setting admin role not failed");
	})   

})