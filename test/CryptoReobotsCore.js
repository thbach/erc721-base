const { expectRevert, time } = require('@openzeppelin/test-helpers');
const Game = artifacts.require('CryptoRobotsCore.sol');

contract('Game', accounts => {
    let game;
    const [admin, player1, player2, player3, player4] = [accounts[0], accounts[1], accounts[2], accounts[3], accounts[4]];

    beforeEach(async () => {
        game = await Game.new('crypto robots', 'cbot', 'https://url-to-your-game-server/');
    });

    it('should NOT mint if not owner', async () => {
        await expectRevert(
            game.mint({from: player1}),
            '018001'
        );
    });

    it('should mint and impletment metadata', async () => {
        const symbol = await game.symbol();
        const name = await game.name();
        await game.mint();
        const tokenURI = await game.tokenURI(0);

        assert(name == 'crypto robots');
        assert(symbol == 'cbot');
        // assert(tokenURI == 'https://url-to-your-game-server/');
    })

    it('Should return total supply / implement enumerable', async () => {
        for(let i = 0; i < 5; i ++) {
            await game.mint();
        }

        const totalSupply = await game.totalSupply();
        const tokenByIndex = await game.tokenByIndex(2);
        const tokenOfOwnerByIndex = await game.tokenOfOwnerByIndex(admin, 3);

        assert(totalSupply == 5);
        assert(tokenByIndex == 2);
        assert(tokenOfOwnerByIndex == 3);

    })

    it('Should transfer and approve and transferFrom', async () => {
        for(let i = 0; i < 5; i ++) {
            await game.mint();
        }

        await game.safeTransferFrom(admin, player1, 2, {from: admin});
        await game.approve(player2, 3, {from: admin});
        await game.setApprovalForAll(player3, true, {from: admin});
        await game.safeTransferFrom(admin, player4, 3, {from: player2});
        await game.safeTransferFrom(admin, player4, 1, {from: player3});

        const balanceP1 = await game.balanceOf(player1);
        const balanceP4 = await game.balanceOf(player4);
        assert(balanceP1 == 1);
        assert(balanceP4 == 2);

        const newOwner = await game.ownerOf(1);
        assert(newOwner == player4);
    })


    it('Should mint get all robots and all robots of address', async () => {
        for(let i = 0; i < 10; i ++) {
            await game.mint();
            time.increase(8000)
        }

        await game.safeTransferFrom(admin, player1, 2, {from: admin});
        await game.safeTransferFrom(admin, player1, 3, {from: admin});
        await game.safeTransferFrom(admin, player1, 4, {from: admin});

        const token = await game.tokenByIndex(1);
        const tokenOwner = await game.tokenOfOwnerByIndex(player1, 0);
        const totalSupply = await game.totalSupply();

        console.log(parseInt(token));
        console.log(parseInt(tokenOwner));
        console.log(parseInt(totalSupply));

        // const allRobots = await game.getAllRobots();
        // const robotsOfP1 = await game.getAllRobotsOff(player1);

        // console.log(allRobots);
        // console.log(allRobots.length);
        // console.log(allRobots[2][2]);
        // console.log(robotsOfP1);

        // assert(allRobots[1].id == 1);
        // assert(robotsOfP1[0].id == 2);
    })

    it('Should burn a token', async () => {
        for(let i = 0; i < 10; i ++) {
            await game.mint();
            time.increase(8000)
        }

        await game.safeTransferFrom(admin, player1, 2, {from: admin});
        await game.safeTransferFrom(admin, player1, 3, {from: admin});
        await game.safeTransferFrom(admin, player1, 4, {from: admin});

        let token = await game.tokenByIndex(1);
        let tokenOwner = await game.tokenOfOwnerByIndex(player1, 0);
        let totalSupply = await game.totalSupply();
        let allRobots = await game.getAllRobots();
        let robotsOf = await game.getAllRobotsOf(player1);

        console.log('token1', parseInt(token));
        console.log('1st token player1', parseInt(tokenOwner));
        console.log('total supply', parseInt(totalSupply));
        console.log(allRobots[1].id);
        console.log(allRobots[1].active);
        console.log('player1 robots', robotsOf)

        await game.burn(1);
        await game.burn(2);
        token = await game.tokenByIndex(1);
        tokenOwner = await game.tokenOfOwnerByIndex(player1, 0);
        totalSupply = await game.totalSupply();
        allRobots = await game.getAllRobots();
        robotsOf = await game.getAllRobotsOf(player1);

        console.log('token1', parseInt(token));
        console.log('1st token player1', parseInt(tokenOwner));
        console.log('total supply', parseInt(totalSupply));
        console.log(allRobots[1].id);
        console.log(allRobots[1].active);
        console.log('player1 robots', robotsOf)


        await game.burn(4);
        token = await game.tokenByIndex(2);
        tokenOwner = await game.tokenOfOwnerByIndex(player1, 0);
        totalSupply = await game.totalSupply();
        allRobots = await game.getAllRobots();
        robotsOf = await game.getAllRobotsOf(player1);

        console.log('token1', parseInt(token));
        console.log('1st token player1', parseInt(tokenOwner));
        console.log('total supply', parseInt(totalSupply));
        console.log(allRobots[4].id);
        console.log(allRobots[4].active);
        console.log('player1 robots', robotsOf)


    })

    it('Should NOT bread some robots', async () => {
        for(let i = 0; i < 10; i ++) {
            await game.mint();
            time.increase(8000)
        }

        await game.safeTransferFrom(admin, player1, 2, {from: admin});
        await game.safeTransferFrom(admin, player1, 3, {from: admin});
        await game.safeTransferFrom(admin, player1, 4, {from: admin});

        await expectRevert(
            game.breed(77, 99),
            '003002'
        );

        await expectRevert(
            game.breed(1, 2),
            '003007'
        );
    })

    it.only('Should bread some robots', async () => {
        for(let i = 0; i < 10; i ++) {
            await game.mint();
            time.increase(8000)
        }

        await game.safeTransferFrom(admin, player1, 2, {from: admin});
        await game.safeTransferFrom(admin, player1, 3, {from: admin});
        await game.safeTransferFrom(admin, player1, 4, {from: admin});

        await game.breed(2,3, {from: player1});

        const totalSupply = await game.totalSupply();
        assert(parseInt(totalSupply) == 11);

        let bot = await game.getRobotByIndex(10);
        console.log(bot);

        await game.burn(4);

        bot = await game.getRobotByIndex(10);
        console.log(bot);

        bot = await game.getRobotByIndex(4);
        console.log(bot);

    })



});
