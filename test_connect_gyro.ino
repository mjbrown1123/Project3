//set pin values
int rotatePin = 3;
int stlPin = 4;

//gyro libraries
#include "I2Cdev.h"
#include "MPU6050_6Axis_MotionApps20.h"

// Arduino Wire library is required if I2Cdev I2CDEV_ARDUINO_WIRE implementation
// is used in I2Cdev.h
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
#include "Wire.h"
#endif

//create gyro object
MPU6050 mpu;

// MPU control/status vars
bool dmpReady = false;  // set true if DMP init was successful
uint8_t mpuIntStatus;   // holds actual interrupt status byte from MPU
uint8_t devStatus;      // return status after each device operation (0 = success, !0 = error)
uint16_t packetSize;    // expected DMP packet size (default is 42 bytes)
uint16_t fifoCount;     // count of all bytes currently in FIFO
volatile uint8_t fifoBuffer[64]; // FIFO storage buffer

// orientation/motion vars
volatile Quaternion q;           // [w, x, y, z]         quaternion container
//VectorInt16 aa;         // [x, y, z]            accel sensor measurements.
//VectorInt16 aaReal;     // [x, y, z]            gravity-free accel sensor measurements
//volatile VectorInt16 aaWorld;    // [x, y, z]            world-frame accel sensor measurements
volatile VectorFloat gravity;    // [x, y, z]            gravity vector
volatile float euler[3];         // [psi, theta, phi]    Euler angle container
volatile float ypr[3];           // [yaw, pitch, roll]   yaw/pitch/roll container and gravity vector

//interrupt pin
volatile bool mpuInterrupt = false;

void dmpDataReady() {
  mpuInterrupt = true;
  
}


void setup() {

//set the pinmodes as inputs for the two buttons
pinMode(rotatePin, INPUT);
pinMode(stlPin, INPUT);

  // join I2C bus (I2Cdev library doesn't do this automatically)
#if I2CDEV_IMPLEMENTATION == I2CDEV_ARDUINO_WIRE
  Wire.begin();
  TWBR = 24; // 400kHz I2C clock (200kHz if CPU is 8MHz)
#elif I2CDEV_IMPLEMENTATION == I2CDEV_BUILTIN_FASTWIRE
  Fastwire::setup(400, true);
#endif

  // initialize serial communication
  Serial.begin(115200);

  // initialize gyro
  mpu.initialize();

  //empty buffer
  while (Serial.available() && Serial.read());

  // load the DMP
  devStatus = mpu.dmpInitialize();

  //set the gyro offsets
  mpu.setXGyroOffset(116);
  mpu.setYGyroOffset(28);
  mpu.setZGyroOffset(24);
  mpu.setZAccelOffset(1761);

  // make sure it worked (returns 0 if so)
  if (devStatus == 0) {

    // turn on the DMP, now that it's ready
    mpu.setDMPEnabled(true);

    // enable Arduino interrupt detection
    attachInterrupt(0, dmpDataReady, RISING);

    //get the interrupt status
    mpuIntStatus = mpu.getIntStatus();

    // set our DMP Ready flag so the main loop() function knows it's okay to use it
    dmpReady = true;

    // get expected DMP packet size for later comparison
    packetSize = mpu.dmpGetFIFOPacketSize();


  }


}

void loop() {
  // put your main code here, to run repeatedly:

  if (!dmpReady) return;

  // wait for MPU interrupt or extra packet(s) available
  while (!mpuInterrupt && fifoCount < packetSize) {


  }

  // reset interrupt flag and get INT_STATUS byte
  mpuInterrupt = false;
  mpuIntStatus = mpu.getIntStatus();

  // get current FIFO count
  fifoCount = mpu.getFIFOCount();

  // check for overflow
  if ((mpuIntStatus & 0x10) || fifoCount == 1024) {

    // if overflow, reset fifo buffer
    mpu.resetFIFO();
    //Serial.println(F("FIFO overflow!"));

    // otherwise, check for DMP data ready interrupt
  } else if (mpuIntStatus & 0x02) {

    // wait for correct available data length, should be a VERY short wait
    while (fifoCount < packetSize) fifoCount = mpu.getFIFOCount();

    // read a packet from FIFO
    mpu.getFIFOBytes(fifoBuffer, packetSize);

    // track FIFO count here in case there is > 1 packet available
    // (this lets us immediately read more without waiting for an interrupt)
    fifoCount -= packetSize;

    //get orientation values from gyro
    mpu.dmpGetQuaternion(&q, fifoBuffer);
    mpu.dmpGetGravity(&gravity, &q);
    mpu.dmpGetYawPitchRoll(ypr, &q, &gravity);

    //get the status from the rotation button
    int rotateButtonState = digitalRead(rotatePin);

    //get the stl status (if 1, we want to change the STL)
    int stlButtonState = digitalRead(stlPin);
    
    //send a string using yaw, pitch, roll, stl, and rotation values
    String sending = "Y" + String((double)ypr[0]) + "P" + String((double)ypr[1]) + "R" + String((double)ypr[2]) + "A" + rotateButtonState + "B" + stlButtonState + "C";

    //print this send value to processing
    Serial.print(sending);

  }
}
