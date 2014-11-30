<?php
/**
 * Entity for Order
 *
 * @package    Core
 * @subpackage Entity
 * @author     lhe<helin16@gmail.com>
 */
class Order extends InfoEntityAbstract
{
	/**
	 * The order No from magento
	 * 
	 * @var string
	 */
	private $orderNo = '';
	/**
	 * The order date from magento
	 * 
	 * @var UDate
	 */
	private $orderDate;
	/**
	 * The invoice Number
	 * 
	 * @var string
	 */
	private $invNo = '';
	/**
	 * The status of the order
	 * 
	 * @var OrderStatus
	 */
	protected $status;
	/**
	 * The payments that has been done for this order
	 * 
	 * @var multiple:Payment
	 */
	protected $payments;
	/**
	 * The total amount due for the order
	 * 
	 * @var number
	 */
	private $totalAmount;
	/**
	 * The total amount paid for the order
	 *
	 * @var number
	 */
	private $totalPaid = 0;
	/**
	 * The shippment of the order
	 * 
	 * @var multiple:Shippment
	 */
	protected $shippments;
	/**
	 * The shipping address
	 * 
	 * @var Address
	 */
	protected $shippingAddr;
	/**
	 * The billing address
	 * 
	 * @var Address
	 */
	protected $billingAddr;
	/**
	 * The array of order items
	 * 
	 * @var Multiple:OrderItem
	 */
	protected $orderItems;
	/**
	 * The customer of this order
	 * 
	 * @var Customer
	 */
	protected $customer;
	/**
	 * Wether the order passed the payment check
	 * 
	 * @var bool
	 */
	private $passPaymentCheck;
	/**
	 * Whether this order is imported from B2B
	 * 
	 * @var bool
	 */
	private $isFromB2B;
	/**
	 * The Preivous Status pri to change
	 * 
	 * @var OrderStatus
	 */
	private $_previousStatus = null;
	/**
	 * Getter for orderNo
	 *
	 * @return string
	 */
	public function getOrderNo() 
	{
	    return $this->orderNo;
	}
	/**
	 * Setter for orderNo
	 *
	 * @param string $value The orderNo
	 *
	 * @return Order
	 */
	public function setOrderNo($value) 
	{
	    $this->orderNo = $value;
	    return $this;
	}
	/**
	 * Getter for orderDate
	 *
	 * @return UDate
	 */
	public function getOrderDate() 
	{
		if(is_string($this->orderDate))
			$this->orderDate = new UDate($this->orderDate);
	    return $this->orderDate;
	}
	/**
	 * Setter for orderDate
	 *
	 * @param string $value The orderDate
	 *
	 * @return Order
	 */
	public function setOrderDate($value) 
	{
	    $this->orderDate = $value;
	    return $this;
	}
	/**
	 * Getter for invNo
	 *
	 * @return string
	 */
	public function getInvNo() 
	{
	    return $this->invNo;
	}
	/**
	 * Setter for invNo
	 *
	 * @param string $value The invNo
	 *
	 * @return Order
	 */
	public function setInvNo($value)
	{
	    $this->invNo = $value;
	    return $this;
	}
	/**
	 * Getter for status
	 *
	 * @return OrderStatus
	 */
	public function getStatus() 
	{
		$this->loadManyToOne('status');
	    return $this->status;
	}
	/**
	 * Setter for status
	 *
	 * @param OrderStatus $value The status
	 *
	 * @return Order
	 */
	public function setStatus($value) 
	{
		if($this->status !== null)
			$this->_previousStatus = $this->getStatus();
	    $this->status = $value;
	    return $this;
	}
	/**
	 * Getter for payments
	 *
	 * @return Multiple:Payment
	 */
	public function getPayments() 
	{
		$this->loadOneToMany('payments');
	    return $this->payments;
	}
	/**
	 * Setter for payments
	 *
	 * @param Multiple:Payment $value The payments
	 *
	 * @return Order
	 */
	public function setPayments($value) 
	{
	    $this->payments = $value;
	    return $this;
	}
	/**
	 * Getter for totalAmount
	 *
	 * @return number
	 */
	public function getTotalAmount() 
	{
	    return $this->totalAmount;
	}
	/**
	 * Setter for totalAmount
	 *
	 * @param number $value The totalAmount
	 *
	 * @return Order
	 */
	public function setTotalAmount($value) 
	{
	    $this->totalAmount = $value;
	    return $this;
	}
	/**
	 * Getter for totalPaid
	 *
	 * @return number
	 */
	public function getTotalPaid() 
	{
	    return $this->totalPaid;
	}
	/**
	 * Setter for totalPaid
	 *
	 * @param number $value The totalPaid
	 *
	 * @return Order
	 */
	public function setTotalPaid($value) 
	{
	    $this->totalPaid = $value;
	    return $this;
	}
	/**
	 * Getter for shippments
	 *
	 * @return Shippment
	 */
	public function getShippments() 
	{
		$this->loadOneToMany('shippments');
	    return $this->shippments;
	}
	/**
	 * Setter for shippments
	 *
	 * @param Shippment $value The shippments
	 *
	 * @return Order
	 */
	public function setShippments($value) 
	{
	    $this->shippments = $value;
	    return $this;
	}
	/**
	 * Getter for the totalDue
	 * 
	 * @return number
	 */
	public function getTotalDue()
	{
		return round($this->getTotalAmount() - $this->getTotalPaid(), 4);
	}
	/**
	 * Getter for shippingAddr
	 *
	 * @return Address
	 */
	public function getShippingAddr() 
	{
		$this->loadManyToOne('shippingAddr');
	    return $this->shippingAddr;
	}
	/**
	 * Setter for shippingAddr
	 *
	 * @param Address $value The shippingAddr
	 *
	 * @return Order
	 */
	public function setShippingAddr($value) 
	{
	    $this->shippingAddr = $value;
	    return $this;
	}
	/**
	 * Getter for billingAddr
	 *
	 * @return Address
	 */
	public function getBillingAddr() 
	{
		$this->loadManyToOne('billingAddr');
	    return $this->billingAddr;
	}
	/**
	 * Setter for billingAddr
	 *
	 * @param Address $value The billingAddr
	 *
	 * @return Order
	 */
	public function setBillingAddr($value) 
	{
	    $this->billingAddr = $value;
	    return $this;
	}
	/**
	 * Getter for passPaymentCheck
	 *
	 * @return bool
	 */
	public function getPassPaymentCheck() 
	{
	    return trim($this->passPaymentCheck) === '1';
	}
	/**
	 * Setter for passPaymentCheck
	 *
	 * @param bool $value The passPaymentCheck
	 *
	 * @return Order
	 */
	public function setPassPaymentCheck($value) 
	{
	    $this->passPaymentCheck = $value;
	    return $this;
	}
	/**
	 * Getter for orderItems
	 *
	 * @return Multiple:OrderItem
	 */
	public function getOrderItems() 
	{
		$this->loadOneToMany('orderItems');
	    return $this->orderItems;
	}
	/**
	 * Setter for orderItems
	 *
	 * @param array $value The orderItems
	 *
	 * @return Order
	 */
	public function setOrderItems($value)
	{
		$this->orderItems = $value;
		return $this;
	}
	/**
	 * Getter for isFromB2B
	 *
	 * @return bool
	 */
	public function getIsFromB2B() 
	{
	    return (trim($this->isFromB2B) === '1');
	}
	/**
	 * Setter for isFromB2B
	 *
	 * @param unkown $value The isFromB2B
	 *
	 * @return Order
	 */
	public function setIsFromB2B($value) 
	{
	    $this->isFromB2B = $value;
	    return $this;
	}
	/**
	 * Getter for customer
	 *
	 * @return Customer
	 */
	public function getCustomer() 
	{
		$this->loadManyToOne('customer');
	    return $this->customer;
	}
	/**
	 * Setter for customer
	 *
	 * @param unkown $value The customer
	 *
	 * @return Order
	 */
	public function setCustomer($value) 
	{
	    $this->customer = $value;
	    return $this;
	}
	/**
	 * Getting the order by order no
	 * 
	 * @param string $orderNo
	 * 
	 * @return Ambigous <NULL, unknown>
	 */
	public static function getByOrderNo($orderNo)
	{
		$items = self::getAllByCriteria('orderNo = ?', array($orderNo), false, 1, 1);
		return (count($items) === 0 ? null : $items[0]);
	}
	/**
	 * checking whether the order can be edit by a role
	 * 
	 * @param Role $role The role who is trying to edit the roder
	 * 
	 * @return boolean
	 */
	public function canEditBy(Role $role)
	{
		return AccessControl::canEditOrder($this, $role);
	}
	/**
	 * (non-PHPdoc)
	 * @see BaseEntityAbstract::postSave()
	 */
	public function postSave()
	{
		if(trim($this->getOrderNo()) === '')
		{
			$this->setOrderNo('BPCO' .str_pad('0', 8, STR_PAD_LEFT))
				->save();
		}
		if($this->_previousStatus instanceof OrderStatus && $this->_previousStatus->getId() !== $this->getStatus()->getId())
		{
			$infoType = OrderInfoType::get(OrderInfoType::ID_MAGE_ORDER_STATUS_BEFORE_CHANGE);
			$orderInfos = OrderInfo::find($this, $infoType, false, 1, 1);
			$orderInfo = count($orderInfos) === 0 ? null : $orderInfos[0];
			OrderInfo::create($this, $infoType, $this->_previousStatus->getId(), $orderInfo);
			Log::LogEntity($this, 'Changed Status from [' . $this->_previousStatus . '] to [' . $this->getStatus() .']', Log::TYPE_SYSTEM, 'Auto Change', get_class($this) . '::' . __FUNCTION__);
		}
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
	    	$array['totalDue'] = $this->getTotalDue();
	    	$array['infos'] = array();
	    	$array['address']['shipping'] = $this->getShippingAddr() instanceof Address ? $this->getShippingAddr()->getJson() : array();
	    	$array['address']['billing'] = $this->getBillingAddr() instanceof Address ? $this->getBillingAddr()->getJson() : array();
		    foreach($this->getInfos() as $info)
		    {
		    	if(!$info instanceof OrderInfo)
		    		continue;
		        $typeId = $info->getType()->getId();
		        if(!isset($array['infos'][$typeId]))
		            $array['infos'][$typeId] = array();
	            $array['infos'][$typeId][] = $info->getJson();
		    }
		    $array['status'] = $this->getStatus() instanceof OrderStatus ? $this->getStatus()->getJson() : array();
		    
		    $array['shippments'] = array();
		    foreach($this->getShippments() as $shippment)
		    {
		    	if(!$shippment instanceof Shippment)
		    		continue;
		    	$array['shippments'][] = $shippment->getJson();
		    }
	    }
	    return parent::getJson($array, $reset);
	}
	/**
	 * (non-PHPdoc)
	 * @see BaseEntity::__loadDaoMap()
	 */
	public function __loadDaoMap()
	{
		DaoMap::begin($this, 'ord');
		DaoMap::setStringType('orderNo');
		DaoMap::setStringType('invNo');
		DaoMap::setDateType('orderDate');
		DaoMap::setManyToOne('customer', 'Customer', 'o_cust');
		DaoMap::setIntType('totalAmount', 'Double', '10,4');
		DaoMap::setIntType('totalPaid', 'Double', '10,4');
		DaoMap::setBoolType('passPaymentCheck');
		DaoMap::setBoolType('isFromB2B');
		DaoMap::setManyToOne('status', 'OrderStatus', 'o_status');
		DaoMap::setManyToOne('billingAddr', 'Address', 'baddr');
		DaoMap::setManyToOne('shippingAddr', 'Address', 'saddr');
		
		DaoMap::setOneToMany('shippments', 'Shippment', 'o_ship');
		DaoMap::setOneToMany('payments', 'Payment', 'py');
		DaoMap::setOneToMany('orderItems', 'OrderItem', 'o_items');
		parent::__loadDaoMap();
		
		DaoMap::createUniqueIndex('orderNo');
		DaoMap::createIndex('invNo');
		DaoMap::createIndex('orderDate');
		DaoMap::createIndex('passPaymentCheck');
		DaoMap::createIndex('isFromB2B');
		DaoMap::commit();
	}
	/**
	 * 
	 * @param Customer $customer
	 * @param string $orderNo
	 * @param Order $status
	 * @param string $orderDate
	 * @param string $isFromB2B
	 * @param Address $shipAddr
	 * @param Address $billAddr
	 */
	public static function create(Customer $customer, $orderNo = null, Order $status = null, $orderDate = null, $isFromB2B = false, Address $shipAddr = null, Address $billAddr = null)
	{
		$o = new Order();
		return $o->setOrderNo(trim($orderNo))
			->setCustomer($customer)
			->setStatus($status instanceof OrderStatus ? $status : OrderStatus::get(OrderStatus::ID_NEW))
			->setOrderDate(trim($orderDate) === '' ? trim(new UDate()) : trim($orderDate))
			->setIsFromB2B($isFromB2B)
			->setShippingAddr($shipAddr instanceof Address ? $shipAddr : $customer->getShippingAddress())
			->setBillingAddr($billAddr instanceof Address ? $billAddr : $customer->getBillingAddress())
			->save();
	}
}