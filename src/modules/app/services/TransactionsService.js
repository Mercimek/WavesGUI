(function () {
    'use strict';

    /**
     * @param {app.utils.apiWorker} apiWorker
     * @param {app.utils.decorators} decorators
     * @param {User} user
     * @param {app.utils} utils
     * @return {AssetsService}
     */
    const factory = function (apiWorker, decorators, user, utils) {

        class TransactionsService {

            transactions() {
                return user.onLogin().then(() => {
                    return this._getTransactions(user.address);
                });
            }

            /**
             * @param {string} address
             * @private
             */
            @decorators.cachable(2)
            _getTransactions(address) {
                return apiWorker.process((Waves, address) => {
                    return Waves.API.Node.v2.addresses.transactions(address)
                        .then((list) => {
                            return list.map((item) => {
                                const timestamp = new Date(item.timestamp);
                                const fee = item.fee && item.fee.toJSON();
                                const amount = item.amount && item.amount.toJSON();
                                const result = Object.create(null);
                                Object.keys(item).forEach((name) => {
                                    result[name] = item[name];
                                });
                                result.fee = fee;
                                result.amount = amount;
                                result.timestamp = timestamp;
                                return result;
                            });
                        });
                }, address);
            }

        }

        return utils.bind(new TransactionsService());
    };

    factory.$inject = ['apiWorker', 'decorators', 'user', 'utils'];

    angular.module('app')
        .factory('transactionsService', factory);
})();
