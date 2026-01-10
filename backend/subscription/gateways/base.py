from abc import ABC, abstractmethod

class BasePaymentGateway(ABC):
    @abstractmethod
    def initiate_payment(self, transaction):
        """
        Initiates a payment.
        :param transaction: Transaction object
        :return: Dict containing 'payment_url' or 'client_secret' and 'gateway_txn_id'
        """
        pass

    @abstractmethod
    def verify_payment(self, data):
        """
        Verifies a payment callback/webhook.
        :param data: Request data
        :return: Boolean (is_successful), String (gateway_txn_id), Dict (metadata)
        """
        pass
