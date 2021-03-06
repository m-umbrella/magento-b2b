<?php
/**
 * Entity for Payment
 *
 * @package    Core
 * @subpackage Entity
 * @author     lhe<helin16@gmail.com>
 */
class Payment extends BaseEntityAbstract
{
	/**
	 * The payment method
	 * 
	 * @var PaymentMethod
	 */
	protected $method;
	/**
	 * The order of this payment
	 * 
	 * @var Order
	 */
	protected $order;
	/**
	 * The value of this payment
	 * 
	 * @var double
	 */
	private $value;
	/**
	 * Getter for method
	 *
	 * @return PaymentMethod
	 */
	public function getMethod() 
	{
	    $this->loadManyToOne('method');
		return $this->method;
	}
	/**
	 * Setter for method
	 *
	 * @param PaymentMethod $value The method
	 *
	 * @return Payment
	 */
	public function setMethod(PaymentMethod $value) 
	{
	    $this->method = $value;
	    return $this;
	}
	/**
	 * Getter for order
	 *
	 * @return Order
	 */
	public function getOrder() 
	{
		$this->loadManyToOne('order');
		return $this->order;
	}
	/**
	 * Setter for order
	 *
	 * @param unkown $value The order
	 *
	 * @return Payment
	 */
	public function setOrder($value) 
	{
	    $this->order = $value;
	    return $this;
	}
	/**
	 * Getter for value
	 *
	 * @return number
	 */
	public function getValue() 
	{
	    return $this->value;
	}
	/**
	 * Setter for value
	 *
	 * @param number $value The value
	 *
	 * @return Payment
	 */
	public function setValue($value) 
	{
	    $this->value = $value;
	    return $this;
	}
	/**
	 * (non-PHPdoc)
	 * @see BaseEntityAbstract::__toString()
	 */
	public function __toString()
	{
		return trim($this->getMethod() . ': ' . $this->getValue() . " for Order:" . $this->getOrder()->getOrderNo());
	}
	
	/**
	 * (non-PHPdoc)
	 * @see BaseEntityAbstract::getJson()
	 */
	public function getJson($extra = '', $reset = false)
	{
		$array = array();
		if(!$this->isJsonLoaded($reset))
		{
			$array['method'] = $this->getMethod()->getJson();
			$array['createdBy'] = $this->getCreatedBy()->getJson();
		}
		return parent::getJson($array, $reset);
	}
	
	/**
	 * (non-PHPdoc)
	 * @see HydraEntity::__loadDaoMap()
	 */
	public function __loadDaoMap()
	{
		DaoMap::begin($this, 'py');
	
		DaoMap::setManyToOne('order', 'Order', 'ord');
		DaoMap::setManyToOne('method', 'PaymentMethod', 'py_method');
		DaoMap::setIntType('value', 'Double', '10,4');
		parent::__loadDaoMap();
	
		DaoMap::commit();
	}
	/**
	 * Creating a payment for order
	 * 
	 * @param Order         $order
	 * @param PaymentMethod $method
	 * @param string        $value
	 * 
	 * @return Ambigous <BaseEntityAbstract, GenericDAO>
	 */
	public static function create(Order $order, PaymentMethod $method, $value)
	{
		$payment = new Payment();
		$message = 'A payment via ' . $method->getName() . ' is made with value: ' . StringUtilsAbstract::getCurrency($value);
		$payment = $payment->setOrder($order)
			->setMethod($method)
			->setValue($value)
			->save()
			->addComment($message, Comments::TYPE_SYSTEM)
			->addLog($message, Log::TYPE_SYSTEM, get_class($payment) . '_CREATION', __CLASS__ . '::' . __FUNCTION__);
		$order->addComment($message, Comments::TYPE_SYSTEM)
			->addLog($message, Log::TYPE_SYSTEM, 'Auto Log', __CLASS__ . '::' . __FUNCTION__);
		return $payment;
	}
}